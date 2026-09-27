"""Pure compiler shared with native prototype. No process or network execution."""
import json, sys, types, re
stub=types.ModuleType('litert_runtime');stub.MODEL='Gemma 4 E2B web';stub.LocalModel=object
sys.modules['litert_runtime']=stub
import logic
from logic import core as C, solution as G, theory as T
import scenario_library as S, nlp, pacing
from case_review import split_cases
DEFAULT=json.load(open('/app/default.json'))

def view(c,s):
    if s.get('domain')=='theory': return T.view(c,s)
    return dict(id=c['id'],text=c['text'],kind=c['kind'],summary=logic.render_claim(c),assumptions=[logic.render_expr(a) for a in c['assumptions']],conclusion=logic.render_expr(c['conclusion']),dependencies=c['depends_on'],strategy=c.get('strategy'),graph=c)

def coq(e):
    if e.op=='atom': return {'safe':'s','truthful':'t','observed':'r'}[e.value]
    if e.op=='const': return str(e.value).lower()
    a=[coq(c) for c in e.children]
    if e.op=='not': return '(negb '+a[0]+')'
    if e.op=='answer': return '(if '+('t' if e.value=='asked' else '(negb t)')+' then '+a[0]+' else (negb '+a[0]+'))'
    if e.op=='implies': return '(orb (negb '+a[0]+') '+a[1]+')'
    if e.op=='iff': return '(if '+a[0]+' then '+a[1]+' else (negb '+a[1]+'))'
    return '('+{'and':'andb','or':'orb'}[e.op]+' '+' '.join(a)+')'

def theorem(name,e,observed=False):
    variables='s t r' if observed else 's t'
    return ['Theorem '+name+' : forall '+variables+':bool, '+coq(e)+' = true.', 'Proof.', 'intros '+variables+'.', 'destruct s; destruct t; '+('destruct r; ' if observed else '')+'reflexivity.', 'Qed.']

def parse(raw,s,accepted):
    c=T.parse_claim(raw,s) if s.get('domain')=='theory' else logic.parse_claim(raw)
    if not set(c['depends_on']) <= {x['id'] for x in accepted}: raise ValueError('Only accepted dependencies may be cited.')
    return c

def compile_step(c,accepted,s):
    c=parse(c,s,accepted)
    if s.get('domain')=='theory':
        pl,ids=T.prolog_source(c,s);thy,_=T.hol_source(c,s)
        return dict(claim=c,prolog=pl,isabelle=thy,coq=[],scope='Conditional proof over the inspected finite scenario rules; problem-only HOL source is reference, not executed in the browser.',graph=dict(kind='named-proposition graph',candidate=c,nodes=[n for p,n in s['nodes'].items() if p in ids.values()],rules=[r for r in s['rules'] if r['conclusion'] in ids.values()],accepted=accepted,prolog_atom_map=ids))
    claim=C._claim(c);deps=C._dependencies(claim,accepted)
    sentences=[]
    for i,x in enumerate([*deps,claim]): sentences+=theorem('step_'+str(i),C._theorem(x))
    # Independently prove assumptions are satisfiable, not only implication.
    e=C._and(claim.assumptions)
    sentences+=['Theorem possible : exists s t:bool, '+coq(e)+' = true.','Proof.','first [ exists true,true; reflexivity | exists true,false; reflexivity | exists false,true; reflexivity | exists false,false; reflexivity ].','Qed.']
    thy,_=C._isabelle_source(claim,deps)
    return dict(claim=c,prolog=C._prolog_source(claim,deps),isabelle=thy,coq=sentences,scope='Exhaustive Boolean Two Guards semantics, including non-vacuous assumptions.',graph=dict(kind='Boolean argument graph',candidate=c,accepted=accepted,effective_theorem=C._theorem(claim).json()))

def named_certificate(c,s,result):
    nodes=list(s['nodes']);ids={p:'a'+str(i) for i,p in enumerate(nodes)};wanted=T.relevant_projection(c,s)
    sentences=['Section Scenario.','Variables '+' '.join(ids[p] for p in nodes if p in wanted)+' : Prop.']
    for p,n in s['nodes'].items():
        if p in wanted and n['fact']: sentences.append('Hypothesis f_'+ids[p]+' : '+ids[p]+'.')
    for i,r in enumerate(s['rules']):
        if r['conclusion'] not in wanted:continue
        sentences.append('Hypothesis r'+str(i)+' : '+' -> '.join([ids[p] for p in r['premises']]+[ids[r['conclusion']]])+'.')
    # Bridge explicit negation propositions with visible conditional premises.
    terms={' '.join(n['hol'].split()):p for p,n in s['nodes'].items()}
    for term,p in terms.items():
        if p in wanted and term.startswith(r'\<not> ') and term[7:] in terms:
            q=terms[term[7:]]
            sentences+=['Hypothesis negative_'+ids[p]+' : '+ids[p]+' -> ~ '+ids[q]+'.','Hypothesis negative_'+ids[q]+' : '+ids[q]+' -> ~ '+ids[p]+'.']
    def proof(t):
        if t['kind']=='fact': return 'f_'+t['atom'][4:-1]
        return '('+t['rule']+' '+ ' '.join(proof(x) for x in t['premises'])+')'
    for i,(lit,tree) in enumerate(zip(c['assumptions']+c['conclusions'],result['trace'])):
        sentences+=['Theorem derived_'+str(i)+' : '+('' if lit['positive'] else '~ ')+ids[lit['id']]+'.','Proof.','exact '+proof(tree)+'.','Qed.']
    sentences+=['End Scenario.']
    return sentences

def prepare_goal(accepted,s):
    if s.get('domain')=='theory':
        learned=set()
        for c in accepted:
            for lit in c['conclusions']:
                if lit['positive']: learned.update(s['nodes'][lit['id']]['covers'])
        missing=[p for p in s['targets'] if p not in learned]
        if missing: return dict(status='not_discovered',detail='I have not yet established every part of the scenario goal.',theorem=s['goal'],graph=dict(targets=s['targets'],learned=sorted(learned),missing=missing))
        c=dict(id='goal',text='Scenario goal',conclusions=[dict(id=p,positive=True) for p in s['targets']],assumptions=[],depends_on=[])
        return dict(status='candidate',compiled=compile_step(c,accepted,s),witness=dict(conclusions=[s['nodes'][p]['label'] for p in s['targets']],supporting_claims=[c['id'] for c in accepted]))
    claims,questions=G._prepare(accepted)
    return dict(status='search',prolog=G._prolog_source(claims,questions),theorem=G.THEOREM)

def finish_goal(accepted,result):
    claims,questions=G._prepare(accepted)
    if result['status']!='discovered': return dict(status=result['status'],theorem=G.THEOREM,detail='I can identify both doors; I still need to state both door choices.' if result['status']=='awaiting_strategy' else 'I still need a question and an explicit safe choice after each possible answer.')
    q=questions[result['candidate']];no=result['on_no'];yes=result['on_yes']
    r=C.Expr('atom','observed'); safe=C.Expr('atom','safe')
    choose=C.Expr('or',children=(C.Expr('and',children=(r,C.Expr('const',yes))),C.Expr('and',children=(C.Expr('not',children=(r,)),C.Expr('const',no)))))
    graph=C._and(tuple(G._replace(C._theorem(c),q,r) for c in claims))
    coverage=[]
    for answer,chosen in [(False,no),(True,yes)]:
        premises=C.Expr('const',False)
        for c in claims:
            if c.strategy and c.strategy.question==q:
                choice=c.strategy.on_yes if answer else c.strategy.on_no
                if choice is not None and (choice=='tested')==chosen: premises=C.Expr('or',children=(premises,G._replace(C._and(c.assumptions),q,r)))
        condition=r if answer else C.Expr('not',children=(r,))
        coverage.append(C.Expr('implies',children=(condition,premises)))
    sentences=theorem('graph_determines_doors',C.Expr('implies',children=(graph,C.Expr('iff',children=(choose,safe)))),True)
    sentences+=theorem('explicit_choices',C.Expr('implies',children=(graph,C._and(tuple(coverage)))),True)
    sentences+=theorem('consistent_graph',G._replace(graph,r,q))
    sentences+=theorem('safe_strategy',G._replace(C.Expr('iff',children=(choose,safe)),r,q))
    # Concrete witnesses establish existential statement in the kernel.
    qt=coq(q.children[0]);ch=coq(choose)
    response='(if t then question s t else negb (question s t))'
    statement='Theorem solution_exists : exists question : bool -> bool -> bool, exists states : bool -> (bool * bool), exists choose : bool -> bool, forall s t:bool, states '+response+' = (s, negb s) /\\ (if choose '+response+' then s else negb s) = true.'
    sentences+=[statement,'Proof.', 'exists (fun (s t:bool) => '+qt+').','exists (fun (r:bool) => ('+ch+', negb '+ch+')).','exists (fun (r:bool) => '+ch+').','intros s t; destruct s; destruct t; split; reflexivity.','Qed.']
    thy,_=G._isabelle_source(claims,q,no,yes)
    return dict(status='candidate',theorem=G.THEOREM,coq=sentences,isabelle=thy,witness=G._witness(q,no,yes,claims),graph=dict(accepted=accepted,question=q.json()))

class NeedModel(Exception):
    def __init__(self,body): self.body=body
class BrowserGemma(nlp.Gemma):
    def __init__(self,responses): self.responses=iter(responses)
    def request(self,body):
        try: value=next(self.responses)
        except StopIteration: raise NeedModel(body)
        if body.get('format')==nlp.CHOICE_SCHEMA:
            data=json.loads(value)
            original=json.loads(body['messages'][-1]['content'])['student_statement']
            action=r'\b(?:choos\w*|pick\w*|select\w*|enter\w*|go(?:ing)?\s+through|walk\w*\s+through|take\s+(?:the|this|that|a|either|other)\s+door|step\s+through)\b'
            if data.get('has_choice') and not re.search(action,original,re.I):
                # Require an explicit action span in the actual player text.
                # Knowledge-only input still receives the real Gemma proposition pass.
                data['has_choice']=False;data['clarify']=False
            value=json.dumps(data)
        return {'message':{'content':value}}

def dispatch(x):
    op=x['op'];s=x.get('scenario',DEFAULT);a=x.get('accepted',[])
    if op=='compile': return compile_step(x['claim'],a,s)
    if op=='named_certificate': return named_certificate(x['claim'],s,x['result'])
    if op=='goal': return prepare_goal(a,s)
    if op=='goal_finish': return finish_goal(a,x['result'])
    if op=='view': return view(x['claim'],s)
    if op=='parse': return parse(x['claim'],s,a)
    if op=='split': return split_cases(x['text'])
    if op=='import': return S.import_theory(x['source'],DEFAULT)
    if op=='review': return pacing.argumentation_review(x['session'],view)
    if op=='predict': return list(pacing.predictions(a,s))
    if op=='key': return pacing.formal_key(x['claim'],a,s)
    if op=='interpret':
        try: return dict(result=BrowserGemma(x.get('responses',[])).interpret(x['text'],a,s,case_review=x.get('case_review',False)))
        except NeedModel as e: return dict(request=e.body)
    raise ValueError('Unknown compiler operation')

def bridge(raw): return json.dumps(dispatch(json.loads(raw)))

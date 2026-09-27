// Original teaching prompts. These are not automated fallacy diagnoses.
export const REASONING_TOOLS=[
 ['Identify the claim','What exactly am I trying to establish, and what would count as enough?','Separate a report, a given observation, an assumption and a conclusion.'],
 ['Explain the connection','Which rule connects this evidence to my claim, and are all its conditions met?','Explain one inference, then its role in the whole argument. Work backwards to identify the goal\'s conditions, or forwards from an established fact. A true reason and a true conclusion still need a connecting rule.'],
 ['Evaluate the source','Who produced this evidence, for what purpose, and how was it obtained?','Check origin, method, date or version, and relevance. Repetition and prestige do not replace a missing evidential connection.'],
 ['Consider an alternative','What other explanation fits, and which observation could distinguish it?','Represent the alternative fairly. Seek evidence that could challenge my expectation. An unsuccessful search does not automatically prove the opposite.'],
 ['Check the boundary','Am I moving beyond the population, case, time or conditions that were checked?','Distinguish necessary from sufficient conditions. If A implies B, B alone does not establish A. One supporting example does not prove every case.'],
 ['Reflect critically','What changed in my reasoning, what influenced that change, and what will I do next?','Connect an event to its significance and a future action. Consider the task, tools, access supports and expectations. Feelings are optional; no personal disclosure is required.'],
 ['Explain what transfers','Which relationship still applies in a new context, and which assumption needs checking again?','Summarise the method in my words. A different problem asks whether I can adapt the idea.']
];
export const RESEARCH_LINKS=[
 ['Manchester Library · critical analysis','https://www.education.library.manchester.ac.uk/mle/being-critical/'],
 ['Manchester Library · developing an argument','https://www.education.library.manchester.ac.uk/mle/developing-argument/'],
 ['Manchester Library · evaluating sources','https://www.education.library.manchester.ac.uk/mle/evaluating-sources/'],
 ['Manchester Library · reflective writing','https://www.education.library.manchester.ac.uk/mle/packages/writing/'],
 ['Manchester Library · alternative formats','https://education.library.manchester.ac.uk/accessible-versions/all-formats/'],
 ['Loughborough · proof self-explanation','https://www.lboro.ac.uk/departments/maths-education/research/mathematical-cognition/self-ex-training/'],
 ['Gilly Salmon · Five-Stage Model','https://www.gillysalmon.com/the-five-stage-model.html'],
 ['Stanford Encyclopedia · informal logic','https://plato.stanford.edu/entries/logic-informal/']
];
export function coachingPrompt(s,status){
 if(s.guidance==='minimal'||status==='error')return '';
 if(status==='unsupported')return 'I can first check the translation, then identify the missing evidence or rule.';
 if(status==='refuted'||status==='invalid_assumptions')return 'Which part of the checked case challenges my thought? I can revise the claim, a premise, or its scope.';
 const prompts=s.scenario.tutorial?['Which given facts support this step?','How does this step help with the whole goal?']:s.scenario.journey?['What do I know now, and what remains open?','Which new check could distinguish the alternatives?','Does my conclusion stay within the collected evidence?']:['Which condition made this inference possible?','Could I explain the connection without repeating the conclusion?','What would change if one condition were missing?'];
 return prompts[(Math.max(1,s.claims.length)-1)%prompts.length];
}
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
export function reasoningToolkit(){
 const root=el('details');root.className='reasoning-toolkit';root.append(el('summary','Reasoning tools · choose one question'));
 for(const [title,question,detail]of REASONING_TOOLS){const d=el('details');d.append(el('summary',title),el('p',question),el('p',detail));root.append(d);}
 const traps=el('details');traps.append(el('summary','Common reasoning traps'),el('p','These are prompts for examining an argument, not labels assigned to me. A failed formal check is not automatically a fallacy.'));
 const list=el('ul');for(const text of ['Affirming the consequent: “If A then B” and an observation of B do not establish A. Another condition could also produce B.','Hasty generalisation: one checked case may not represent a population.','False dilemma: two proposed explanations may not exhaust the possibilities.','Circular support: repeating a conclusion gives no independent reason.','Straw person: test a fair version of the alternative.','Popularity or irrelevant authority: numbers and reputation do not replace relevant evidence. Relevant expertise can inform an argument; its scope and evidence still matter.','Confirmation bias is a search tendency: choose a check that could challenge my expectation.'])list.append(el('li',text));traps.append(list);root.append(traps);
 const sources=el('details');sources.append(el('summary','Research and further learning · internet links'),el('p','These teaching prompts work offline. The optional external resources need a connection.'));
 for(const [title,url]of RESEARCH_LINKS){const p=el('p'),a=el('a',title);a.href=url;a.target='_blank';a.rel='noopener noreferrer';p.append(a);sources.append(p);}root.append(sources);return root;
}

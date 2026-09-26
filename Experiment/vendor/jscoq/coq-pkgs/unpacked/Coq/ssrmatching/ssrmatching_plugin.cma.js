(function(hw){"use strict";var
hx={},bW="Only identifiers are allowed here",b0="coq-core.plugins.ssreflect",b$="partial term ",T="in",bV="mk_tpattern_matcher with no upats_origin.",ac=246,S=179,b_="(",ab="In",b3="ssrpattern",b9="pattern",b2=118,bZ=157,aa=119,aB=108,a1="As",y=" in ",bU="_ssrpat_",b1="_vendor+v8.17+32bit/coq/plugins/ssrmatching/ssrmatching.ml",b8="The ",aA="in ",a3=136,b6=167,b7="do_once never called.",b5=165,B="coq-core.plugins.ssrmatching",bT="_",a2=137,b4="Qed",bY=" of ",aD=125,aC=248,bX=" as ",o=hw.jsoo_runtime,J=o.caml_check_bound,a0=o.caml_equal,az=o.caml_fresh_oo_id,bS=o.caml_ml_string_length,aZ=o.caml_notequal,aY=o.caml_register_global,bR=o.caml_string_get,K=o.caml_string_notequal,d=o.caml_string_of_jsbytes,p=o.caml_wrap_exception;function
a(a,b){return a.length==1?a(b):o.caml_call_gen(a,[b])}function
b(a,b,c){return a.length==2?a(b,c):o.caml_call_gen(a,[b,c])}function
j(a,b,c,d){return a.length==3?a(b,c,d):o.caml_call_gen(a,[b,c,d])}function
l(a,b,c,d,e){return a.length==4?a(b,c,d,e):o.caml_call_gen(a,[b,c,d,e])}function
$(a,b,c,d,e,f){return a.length==5?a(b,c,d,e,f):o.caml_call_gen(a,[b,c,d,e,f])}function
G(a,b,c,d,e,f,g){return a.length==6?a(b,c,d,e,f,g):o.caml_call_gen(a,[b,c,d,e,f,g])}function
hu(a,b,c,d,e,f,g,h){return a.length==7?a(b,c,d,e,f,g,h):o.caml_call_gen(a,[b,c,d,e,f,g,h])}function
hv(a,b,c,d,e,f,g,h,i,j,k,l){return a.length==11?a(b,c,d,e,f,g,h,i,j,k,l):o.caml_call_gen(a,[b,c,d,e,f,g,h,i,j,k,l])}var
i=o.caml_get_global_data(),R=[0,[0,0,0]],bF=[0,d(B),d(b3)],D=i.Constr,C=i.Evarutil,g=i.EConstr,e=i.Util,v=i.Proofview,L=i.Printer,c=i.Pp,h=i.Evd,ap=i.Reductionops,n=i.Names,bG=i.Ltac_plugin__Tacenv,M=i.Genarg,aw=i.Ltac_plugin__Tacinterp,E=i.Context,q=i.DAst,m=i.CErrors,aM=i.Evar,bf=i.UState,bm=i.Assert_failure,aQ=i.CString,an=i.Ppconstr,z=i.Option,U=i.Environ,u=i.Stdlib,ag=i.Global,N=i.Libnames,bx=i.Constrexpr_ops,bp=i.Termops,bd=i.Pretype_errors,bh=i.Structures,aL=i.SList,aI=i.Evarconv,aJ=i.Unification,H=i.CAst,V=i.Geninterp,ba=i.Genintern,a8=i.Constrintern,a5=i.Feedback,ay=i.Mltop,t=i.CLexer,f=i.Pcoq,al=i.Ltac_plugin__Tacentries,bO=i.Egramml,c1=i.CArray,eY=i.Tacticals,eG=i.Typing,eI=i.Tactics,ea=i.Loc,d2=i.Ltac_plugin__Tacsubst,dL=i.Glob_ops,dH=i.Ltac_plugin__Tacintern,cT=i.Sorts,cB=i.Typeclasses,cz=i.Conv_oracle,co=i.Ftactic,cp=i.Ltac_plugin__Pptactic,cb=i.CamlinternalLazy,ce=i.Goptions,gA=i.Gramlib__LStream;aY(154,[0],"Ssrmatching_plugin");var
ad=m[5],eU=d("matches:"),eV=d("instance:"),eZ=d("Not supported"),eS=[0,1],eT=[0,1],eW=d("BEGIN INSTANCES"),eX=d("END INSTANCES"),eQ=d(b3),eJ=d(b9),eH=d("selected"),eD=d("matching impacts evars"),eB=d(" does not match any subterm of the goal"),eC=d(b$),ez=[0,1],ew=[0,1],et=[0,[0,1,0]],eu=[0,[0,0,[0,1,0]]],es=d("pattern without redex."),el=d("in the pattern?"),em=d('Does the variable bound by the "in" construct occur '),en=d(" did not instantiate ?"),eo=d("Matching the pattern "),eq=[0,1],er=[0,1],ep=[0,1],ej=d("typed as: "),ei=d("decoded as: "),eh=[0,d(b1),1119,58],ee=d(bU),ef=d(a1),eg=d(ab),ec=d("."),ed=d("bad encoding for pattern "),eb=d("interpreting: "),d$=[0,0],d9=d("interpreting a term with no ist"),d7=d(bW),dO=d(bW),dN=d(bU),dM=d("globbing pattern: "),dP=d("( _ as _ )"),dQ=d("( _ as _ in _ )"),dR=d("( _ in _ )"),dS=d("( _ in _ in _ )"),dT=d(ab),dV=d(ab),dW=d(ab),dY=d(ab),dX=d("where are we?."),dU=d(ab),dZ=d(a1),d0=d(a1),dI=d("combineCG: different ist"),dJ=d("have: mixed C-G constr."),dK=d("have: mixed G-C constr."),dv=d(aA),dw=d(y),dx=d(y),dy=d(aA),dz=d(y),dA=d(y),dB=d(y),dC=d(bX),dm=d(aA),dn=d(y),dp=d(y),dq=d(aA),dr=d(y),ds=d(y),dt=d(y),du=d(bX),dl=d("companion function never called."),c9=d("matches but type classes inference fails"),c_=d("does not match any subterm of the goal"),db=d(bV),c$=d("are equal to the "),da=d("all matches of "),dc=d("of "),dd=d(" of the "),dh=d(" of"),de=d(" occurrence"),df=d(" < "),dg=d("Only "),c4=d(bY),c5=d(b8),c2=d(bY),c3=d(b8),c7=d("term "),c8=d(b$),c6=d(bV),c0=d(b7),cY=d(b7),cV=d("incomplete ise in match_upats_FO."),cW=d("IN FO."),cS=[0,d(b1),438,13],cO=d(y),cP=d("indeterminate "),cQ=d("indeterminate pattern"),cE=d("RHS"),cF=d("LHS"),cC=[0,0],cA=[0,1],cu=[0,0],ct=[13,0,0,0],cs=d("not a GLambda"),cq=d("not a CRef."),ci=d("$"),cg=d(")"),ch=d(b_),cf=d("glob_constr: term with no ist"),ca=d("SSR: "),ht=d("SSRMATCHINGDEBUG"),cc=[0,d("Debug"),[0,d("SsrMatching"),0]],cv=[13,0,0,0],cx=d("Ssrmatching_plugin.Ssrmatching.NoProgress"),cD=d("Ssrmatching_plugin.Ssrmatching.NoMatch"),cI=d(bT),cM=d(bT),cU=d("Ssrmatching_plugin.Ssrmatching.FoundUnif"),di=d("Ssrmatching_plugin.Ssrmatching.SsrMatchingFailure"),d6=d("rpatternty"),eM=d(b9),eR=d(B),gB=d(b_),gC=d("@"),e1=d(b0),e2=d(B),fh=d(T),fp=d(T),fz=d(T),fD=d(T),fN=d(T),fR=d(T),f3=d(T),f7=d("as"),gf=d("rpattern"),gg=d(B),gs=d(b4),gy=d("cpattern"),gz=d(B),gE=d("ssrtermkind"),gM=[0,[0,d(B),d("g_ssrmatching.mlg:0")]],gZ=d(b4),g5=d("lcpattern"),g6=d(B),hd=[0,[0,d(B),d("g_ssrmatching.mlg:1")]],hj=d("ssrpatternarg"),hk=d(B),hn=d("ssrinstancesoftpat"),hp=d("ssrinstoftpat"),hq=d(B),hs=d(b0);function
a4(d,b){var
e=a(c[3],b);return j(m[5],d,0,e)}var
aE=a5[6],ae=[0,function(a){return 0}];function
aF(d){var
e=o.caml_obj_tag(d),f=250===e?d[1]:ac===e?a(cb[2],d):d,g=a(c[3],ca),h=b(c[12],g,f);return b(a5[9],0,h)}try{o.caml_sys_getenv(ht);ae[1]=aF}catch(a){a=p(a);if(a!==u[8])throw a}function
a6(a){return a?(ae[1]=aF,0):(ae[1]=function(a){return 0},0)}var
cd=[0,0,cc,function(b){return a(e[3],ae)===aF?1:0},a6];b(ce[4],0,cd);function
af(b){return a(a(e[3],ae),b)}function
a7(d,c){var
a=b(g[3],d,c);return 9===a[0]?[0,a[1],a[2]]:[0,c,[0]]}function
a9(e,d,c){var
a=bR(d,c),b=0;if(48<=a){if(61!==a&&123!==a)b=1}else{if(40===a)return 0;if(!(47<=a))b=1}return b?0===e?1:0:1}function
a_(n,g,f){var
o=a(g,f),p=a(c[52],o),h=b(u[28],p,ci),d=0;for(;;){if(22<bR(h,d)-10>>>0){if(b(n,h,d)){var
i=a(c[3],cg),j=a(g,f),k=a(c[3],ch),l=b(c[12],k,j),m=b(c[12],l,i);return b(c[26],1,m)}return a(g,f)}var
d=b(e[4],d,1);continue}}function
a$(e,d){var
c=a(ag[2],0);return j(e,c,b(h[20],0,c),d)}var
cj=L[21],ck=L[22],cl=an[19],cm=an[18];function
cn(e,g){var
c=a(M[2],e),f=a(V[1][1],e);function
h(b,a){return[0,b,a]}function
i(b,a){return a}function
j(c,b){return a(co[1],[0,f,b])}function
d(c,a,f,e,d){return b(g,c,a)}b(ba[9],c,h);b(ba[10],c,i);b(V[7],c,j);b(V[4],c,[0,[0,f]]);l(cp[1],c,d,d,d);return c}function
aG(c){var
b=c[1];return 0===b[0]?a(N[32],b[1]):0}function
cr(c){var
b=a(q[1],c);if(5===b[0]&&b[1])return 1;return 0}function
aH(e){var
b=a(q[1],e);if(5===b[0]){var
d=b[1];if(d)return[0,d[1],b[4]]}var
f=a(c[3],cs);return l(m[2],0,0,0,f)}function
bb(b){return 13===a(q[1],b)[0]?1:0}function
bc(a){return b(H[1],a,ct)}function
ao(d,c,a){return b(H[1],d,[17,c,2,a])}var
cw=q[3],O=function(a){return b(cw,0,a)}(cv);function
ah(c,a){return b(q[3],0,[14,c,2,a])}var
W=[aC,cx,az(0)];function
ai(f,c,e,d){var
g=a(h[160],c),i=b(U[12],g,f);return $(ap[64],0,i,c,e,d)}function
I(d,a,c,b){try{var
e=$(aI[4],0,d,a,c,b);return e}catch(a){a=p(a);if(a[1]===aI[3])throw[0,bd[1],d,a[2],[4,c,b,[0,a[3]]]];throw a}}function
cy(j,i,d,h,g){var
c=i,a=0,k=d.length-1;for(;;){if(a===k)return c;var
l=b(e[4],a,1),f=b(e[4],h,a),m=J(g,f)[1+f],c=I(j,c,J(d,a)[1+a],m),a=l;continue}}function
aK(e,m,k,i,g){function
n(c,b,a){return l(h[126],c,b,0,a)}var
o=j(h[aB][13],n,k,m),f=a(U[2],e),c=a(cz[9],f),b=a(aJ[4],c)[1],d=[0,0,b[2],b[3],b[4],c,b[6],b[7],b[8],b[9],b[10],1,1],p=[0,[0,d,d,d,0,a(aJ[4],c)[5]]];G(aJ[8],e,o,0,p,i,g);return 0}function
be(i,d,k){var
c=[0,i];function
f(k){var
l=b(g[3],d,k);if(3===l[0]){var
m=l[1],i=m[1],n=b(aL[14][2],f,m[2]),o=a(e[3],c);if(1-b(h[32],o,i)){var
p=b(h[28],d,i),q=b(C[33],d,p),r=a(e[3],c);c[1]=j(h[27],r,i,q)}return a(g[13],[0,i,n])}return j(g[aD],d,f,k)}function
l(g,o,n){var
k=b(h[28],d,g),i=a(h[6],k);if(i){var
l=f(i[1]),m=a(e[3],c);c[1]=j(h[37],g,l,m);return 0}return 0}var
m=f(k);j(h[34],l,i,0);var
n=i!==a(e[3],c)?1:0,o=a(h[bZ],d);return[0,n,a(e[3],c),o,m]}function
aq(k,j,i,s,r,q){var
t=k?k[1]:1,e=l(aI[7],j,0,0,s),u=a(h[64],e),c=be(i,e,r),m=c[4],f=c[3],n=c[2],v=c[1],o=a(h[S],n);function
w(a){return b(h[42],o,a)}var
x=b(aM[7][19],w,u),y=b(h[63],o,x),g=b(h[b5],y,f),p=t?G(cB[22],0,0,0,cA,j,g):g;if(a(q,e)){if(p===g)return[0,v,n,f,m];var
d=be(i,p,m),z=d[4],A=d[2],B=d[1];return[0,B,A,b(bf[9],f,d[3]),z]}throw W}function
X(d,c,f,a){var
g=I(d,c,f,a),e=aq(cC,d,c,g,a,function(a){return 1});return b(h[b5],e[2],e[3])}function
bg(l,c,k){var
d=b(g[3],l,k);switch(d[0]){case
3:return b(aL[14][1],c,d[1][2]);case
5:var
m=d[3];a(c,d[1]);return a(c,m);case
8:var
o=d[4],p=d[3];a(c,d[2]);a(c,p);return a(c,o);case
9:var
q=d[2];a(c,d[1]);return b(e[23][13],c,q);case
13:var
r=d[7],s=d[5],t=d[4][2],u=d[3];a(c,d[6]);b(e[23][13],c,u);a(c,t);b(D[104],c,s);var
v=function(b){return a(c,b[2])};return b(e[23][13],v,r);case
16:return a(c,d[2]);case
19:var
z=d[4],A=d[3];b(e[23][13],c,d[2]);a(c,A);return a(c,z);case
6:case
7:var
n=d[3];a(c,d[2]);return a(c,n);case
14:case
15:var
h=d[1][2],i=h[2],w=h[3],j=b(e[5],i.length-1,1),x=0;if(!(j<0)){var
f=x;for(;;){a(c,J(i,f)[1+f]);a(c,J(w,f)[1+f]);var
y=f+1|0;if(j!==f){var
f=y;continue}break}}return 0;default:return 0}}var
r=[aC,cD,az(0)];function
Y(b){return b?a(c[3],cE):a(c[3],cF)}function
ar(a){return[0,a,0]}function
cG(b,a){return 1}function
cH(c){try{var
d=a(bh[1][8],c),f=b(e[4],1,d);return f}catch(a){a=p(a);if(a===u[8])return 0;throw a}}function
bi(c,a){switch(b(g[3],c,a)[0]){case
4:case
6:case
7:case
13:case
14:case
15:case
17:case
18:case
19:return 1;default:return 0}}var
cJ=a(n[1][7],cI),cK=a(D[2],cJ);function
cL(f,e,d){function
c(d){return a(D[42],d)?cK:b(D[98],c,d)}var
g=c(d);return G(L[2],0,0,0,f,e,g)}var
cN=a(n[1][7],cM),bj=a(g[11],cN);function
w(f,c,e){function
d(a){return b(g[68],c,a)?bj:j(g[aD],c,d,a)}var
h=D[10],i=D[10],k=[0,b(E[4],0,0),i,h],l=a(D[14],k),m=b(g[90],c,bj),n=[0,b(E[4],m,0),l],o=b(U[36],n,f),p=d(e);return G(L[7],0,0,0,o,c,p)}function
bk(G,F,D,B,v,W,V,T,A){var
s=A[1],X=A[2],Z=F?F[1]:0,_=D?D[1]:cG,H=j(ap[27],v,s,T),f=H[2],o=H[1],r=b(g[3],s,o);switch(r[0]){case
3:var
J=r[1][1];if(a(B,J))var
k=f,d=o,i=[0,J];else
if(0===f)if(G)var
K=G[1],ac=K[1],ae=w(v,s,K[2]),af=a(c[3],cO),ag=Y(ac),ah=a(c[3],cP),ai=b(c[12],ah,ag),aj=b(c[12],ai,af),x=j(ad,0,0,b(c[12],aj,ae)),k=x[3],d=x[2],i=x[1];else
var
ak=a(c[3],cQ),y=j(m[5],0,0,ak),k=y[3],d=y[2],i=y[1];else
var
k=f,d=o,i=5;break;case
7:var
k=f,d=o,i=3;break;case
8:var
al=r[4],am=r[2];if(aZ(al,a(g[10],1)))var
k=f,d=o,i=2;else
var
k=f,d=am,i=5;break;case
10:var
L=r[1][1],z=cH(L),N=0;if(0===z||a(e[21][1],f)<z)N=1;else
var
M=b(e[21][112],z,f),an=M[2],k=an,d=b(g[43],o,M[1]),i=[1,L];if(N)var
k=f,d=o,i=1;break;case
16:var
k=f,d=o,i=[1,a(n[70][7],r[1])];break;case
1:case
11:case
12:var
k=f,d=o,i=0;break;default:var
k=f,d=o,i=4}var
I=a(e[23][12],k),aa=a(g[23],[0,d,I]),t=[0,h[aB][1]],p=[0,s],Q=Z?1:0,O=a(U[10],v),P=a(e[21][1],O),R=b(e[4],P,Q);function
q(c){for(;;){var
o=a(e[3],p),f=b(g[3],o,c);if(3===f[0]){var
i=f[1],d=i[1],s=i[2];if(a(B,d)){var
v=a(e[3],p);return j(g[aD],v,q,c)}var
w=a(e[3],p),k=b(h[28],w,d),x=a(h[12],k),y=a(aL[9],s),z=b(e[5],y,R),A=b(u[17],0,z),D=b(e[21][113],A,x),F=function(c,b){var
d=c[2],f=c[1];if(0===b[0]){var
h=b[1],i=q(b[2]),j=a(e[3],p),k=l(g[54],j,h,i,d);return[0,[0,a(g[11],h[1]),f],k]}var
m=b[2],n=b[1],o=q(b[3]),r=q(m),s=a(e[3],p);return[0,f,$(g[56],s,n,r,o,d)]},G=[0,0,q(a(h[3],k))],m=j(E[11][9],F,G,D),H=m[2],I=m[1],n=a(C[1],0),J=a(e[3],t);t[1]=j(h[aB][4],n,H,J);var
K=a(e[3],p),L=a(g[12],n),M=b(g[43],L,I);p[1]=j(h[37],d,M,K);continue}var
r=a(e[3],p);return j(g[aD],r,q,c)}}var
S=q(aa),ab=[0,[0,i,[0,a(e[3],t),S],d,I,W,V,_],0];return[0,s,b(e[22],X,ab)]}function
bl(i,d,f){var
e=d[2],n=d[4],o=d[3],p=d[1],j=a7(e,i),k=j[1],q=j[2],s=a(g[b6][1],k),l=a(D[31],s);switch(l[0]){case
3:var
m=l[1][1];if(b(h[41],e,m))throw r;var
c=[0,m];break;case
7:var
c=3;break;case
8:var
c=2;break;case
10:var
c=1;break;case
1:case
11:case
12:var
c=0;break;default:var
c=4}return[0,p,e,o,[0,c,[0,h[aB][1],i],k,q,n,f[6],f[7]]]}function
cR(d,i,m,l){function
k(b){var
c=a(ag[2],0),f=j(bh[4][1],c,d,[0,[1,i],b])[2][7];return a(e[21][1],f)}function
o(c){var
a=b(g[3],d,c);switch(a[0]){case
9:return a[2].length-1;case
16:return 0;default:throw[0,bm,cS]}}try{var
h=b(g[3],d,m),f=0;switch(h[0]){case
4:var
q=b(g[1][2],d,h[1]),c=k([2,a(cT[13],q)]);break;case
6:var
c=k(0);break;case
10:if(b(n[19][8][2],h[1][1],i))var
c=o(l[3]);else
f=2;break;case
16:var
r=a(n[70][7],h[1]);if(b(n[19][8][2],r,i))var
c=o(l[3]);else
f=1;break;case
1:case
11:case
12:f=2;break;default:f=1}switch(f){case
1:var
c=-1;break;case
2:var
c=k([0,b(g[105],d,m)[1]]);break}return c}catch(a){a=p(a);if(a===u[8])return-1;throw a}}function
bn(e,d,c){var
a=b(g[3],e,c);return 3===a[0]?a0(d,a[1][1]):0}function
as(d,c,b){if(0===c)return d;var
f=c===b.length-1?b:j(e[23][7],b,0,c);return a(g[23],[0,d,f])}function
aN(f){function
d(i,h){var
a=i,d=h;for(;;){var
c=b(g[3],f,a);switch(c[0]){case
5:var
a=c[1];continue;case
9:var
j=c[1],a=j,d=b(e[23][5],c[2],d);continue;default:return[0,a,d]}}}return function(a){var
c=b(g[3],f,a);switch(c[0]){case
9:return d(c[1],c[2]);case
3:case
5:return d(a,[0]);default:return[0,a,[0]]}}}var
aj=[aC,cU,az(0)];function
bo(c,a){var
d=b(h[b2],c,a);return function(a){function
c(c){try{b(h[29],a,c);var
d=1;return d}catch(a){a=p(a);if(a===u[8])return 0;throw a}}return b(aM[7][17],c,d)}}function
cX(C,n,k,d,i,c){var
w=[0,0],x=[0,0],D=bo(d,c);function
f(o,i,s,c,t){var
r=a(aN(c),t),n=r[2],d=r[1],k=[0,-1],q=n.length-1,u=0;function
v(l,n){var
h=l[4].length-1;if(q<h)return n;var
m=l[1],i=0;if(typeof
m==="number")switch(m){case
0:if(j(g[aa],c,l[3],d))var
f=h;else
i=1;break;case
1:if(j(g[aa],c,l[3],d))var
f=h;else
i=1;break;case
2:if(b(g[74],c,d))var
f=h;else
i=1;break;case
3:if(b(g[73],c,d))var
f=h;else
i=1;break;case
4:if(bi(c,d))var
f=h;else
i=1;break;default:var
f=h}else
if(0===m[0])if(bn(c,m[1],d))var
f=h;else
i=1;else
var
p=cR(c,m[1],d,l),o=b(e[4],h,p),r=q<o?-1:o,f=r;if(i)var
f=-1;if(f<h)return n;if(a(e[3],k)<f)k[1]=q;return[0,[0,l,f],n]}var
y=j(e[21][18],v,o,u);for(;;){if(0<=a(e[3],k)){var
z=a(e[3],k);k[1]=-1;var
A=function(j){return function(y){var
q=y[2],f=y[1];if(j<=q)var
t=j<q?1:0;else
if(5===f[1]){k[1]=b(e[5],j,1);var
t=0}else{if(a(e[3],k)<q)k[1]=q;var
t=1}if(t)return 0;try{var
v=0,u=f[1];if(typeof
u==="number")switch(u){case
2:var
r=b(g[95],c,d),J=r[4],K=r[3],L=r[2],M=r[1],B=b(g[95],c,f[3]),N=B[4],O=I(i,c,B[2],L),o=I(b(g[a2],[0,M,K],i),O,N,J);break;case
5:v=1;break;case
3:case
4:var
o=I(i,c,f[3],d);break;default:var
o=c}else
if(0===u[0])var
Q=b(g[98],c,f[3]),R=b(h[56],c,Q),S=b(g[98],c,d),T=b(h[56],c,S),U=function(c,b,a){return I(i,c,b,a)},o=l(e[21][21],U,c,R,T);else
v=1;if(v)var
P=as(d,b(e[5],j,f[4].length-1),n),o=I(i,c,f[3],P);var
E=b(e[5],j,f[4].length-1),F=cy(i,o,f[4],E,n),A=as(d,j,n),G=a(f[7],A),H=a(C,bl(A,aq(0,i,s,F,f[5],G),f));return H}catch(b){b=p(b);if(b[1]===aj){if(a(D,b[2][2]))throw b}else{if(b===W){w[1]=1;return 0}if(b[1]===bd[1]){var
z=b[4];if(typeof
z!=="number"&&19===z[0]){x[1]=1;return 0}}}if(a(m[12],b))return 0;throw b}}}(z);b(e[21][11],A,y);continue}bg(c,function(a){return f(o,i,s,c,a)},d);var
B=function(a){return f(o,i,s,c,a)};return b(e[23][13],B,n)}}f(n,k,d,i,c);if(a(e[3],w))throw W;return a(e[3],x)}function
aO(b,c){return a(e[3],b)?0:(b[1]=[0,a(c,0)],0)}function
bq(d){var
b=a(e[3],d);if(b)return b[1];var
f=a(c[3],cY);return l(m[2],0,0,0,f)}function
cZ(f){var
g=a(e[3],f);if(g){var
d=g[1],h=d[3],i=d[2],j=d[1];f[1]=[0,[0,j,b(e[4],i,1),h]];try{var
k=b(e[21][7],h,i);return k}catch(a){a=p(a);if(a[1]===u[7])throw r;throw a}}var
n=a(c[3],c0);return l(m[2],0,0,0,n)}function
br(c){if(c){var
d=c[1],f=d[4],h=d[2],l=c[2],m=f[5],n=f[4],o=f[3],k=function(d,c){var
e=b(C[25],d,c);return a(g[b6][1],e)},i=function(e,d,c,a){var
f=k(d,a),g=k(e,c);return b(D[84],g,f)},p=function(d){var
a=d[4],b=d[2],g=a[4],k=a[3],e=i(h,b,m,a[5]);if(e){var
f=i(h,b,o,k);if(f)var
l=function(a,c){return i(h,b,a,c)},c=j(c1[37],l,n,g);else
var
c=f}else
var
c=e;return 1-c};return[0,d,br(b(e[21][66],p,l))]}return 0}function
bs(b){return a(g[23],[0,b[3],b[4]])}function
aP(f,e,j,d){if(j){var
g=j[1],k=g[1];if(d&&!d[2]){var
z=d[1],A=g[2],B=a(c[5],0),C=w(f,e,bs(z)),D=a(c[6],4),E=a(c[5],0),F=w(f,e,A),G=a(c[3],c4),H=Y(k),I=a(c[3],c5),J=b(c[12],I,H),K=b(c[12],J,G),L=b(c[12],K,F),M=b(c[12],L,E),N=b(c[12],M,D),O=b(c[12],N,C);return b(c[12],O,B)}var
p=g[2],q=a(c[13],0),r=w(f,e,p),s=a(c[3],c2),t=Y(k),u=a(c[3],c3),v=b(c[12],u,t),x=b(c[12],v,s),y=b(c[12],x,r);return b(c[12],y,q)}if(d&&!d[2]){var
h=d[1],Q=a(c[13],0),R=w(f,e,bs(h)),i=h[1],o=0;if(typeof
i==="number"&&!(5<=i)){var
n=1-b(bp[25],e,h[5]);o=1}if(!o)var
n=0;var
S=n?a(c[3],c7):a(c[3],c8),T=b(c[12],S,R);return b(c[12],T,Q)}var
P=a(c[3],c6);return l(m[2],0,0,0,P)}var
bt=[aC,di,az(0)];function
dj(e){if(e[1]===bt){var
h=e[6],j=e[5],d=e[4],f=e[3],g=e[2];if(typeof
h==="number")switch(h){case
0:var
r=a(c[22],c9),s=aP(g,f,d,j),i=b(c[12],s,r);break;case
1:var
t=a(c[3],c_),u=aP(g,f,d,j),i=b(c[12],u,t);break;default:if(d)var
k=d[1][1];else
var
D=a(c[3],db),k=l(m[2],0,0,0,D);var
v=k?0:1,x=Y(v),y=a(c[3],c$),z=aP(g,f,d,j),A=a(c[3],da),B=b(c[12],A,z),C=b(c[12],B,y),i=b(c[12],C,x)}else{var
n=h[3],o=h[1],E=h[2];if(d)var
p=d[1],F=p[1],G=w(g,f,p[2]),H=a(c[3],dc),I=a(c[5],0),J=w(g,f,n),K=a(c[6],4),L=a(c[5],0),M=Y(F),N=a(c[3],dd),O=b(c[12],N,M),P=b(c[12],O,L),Q=b(c[12],P,K),R=b(c[12],Q,J),S=b(c[12],R,I),T=b(c[12],S,H),q=b(c[12],T,G);else
var
ad=w(g,f,n),ae=a(c[13],0),af=a(c[3],dh),ag=b(c[12],af,ae),q=b(c[12],ag,ad);var
U=b(aQ[46],o,de),V=a(c[3],U),W=a(c[16],E),X=a(c[3],df),Z=a(c[16],o),_=a(c[3],dg),$=b(c[12],_,Z),aa=b(c[12],$,X),ab=b(c[12],aa,W),ac=b(c[12],ab,V),i=b(c[12],ac,q)}return[0,i]}return 0}a(m[7],dj);function
at(e,d,c,b,a){throw[0,bt,e,d,c,b,a]}function
dk(b){if(b){var
c=a(e[3],b[1]);return 1-a(e[21][51],c)}return 0}function
x(F,B,C,H,A,y){var
t=y[2],d=y[1],N=F?F[1]:0,K=B?B[1]:0,q=[0,0],x=[0,0];if(A){var
h=A[1];if(h[1])var
i=h[2],f=i,k=0===i?1:0;else
var
w=h[2],f=w,k=0!==w?1:0}else
var
f=0,k=0;var
s=j(e[21][18],u[17],f,0),M=o.caml_make_vect(s,1-k);function
L(c){var
a=b(e[5],c,1);J(M,a)[1+a]=k;return 0}b(e[21][11],L,f);if(0===s)x[1]=k;var
D=[0,0],v=N?[0,[0,0]]:0;function
O(B){var
k=a(e[3],D);if(k)var
n=k[1],z=n[1],b=a(e[21][5],n[3]),f=b[4],i=f,w=f[4],v=f[3],u=b[3],h=b[2],p=b[1],o=z;else{if(K)throw r;var
A=a(c[3],dl),y=l(m[2],0,0,0,A),d=y[2],j=d[4],i=j,w=j[4],v=j[3],u=d[3],h=d[2],p=d[1],o=y[1]}var
x=a(g[23],[0,v,w]);return s<=a(e[3],q)?[0,x,i[6],[0,p,h,u,i[5]]]:at(o,h,C,t,[0,a(e[3],q),s,x])}return[0,function(f,w,V,X){aO(D,function(y){var
h=[0,0];try{if(!v){var
D=bo(H,w),i=function(w){var
q=a(aN(d),w),o=q[2],h=q[1],k=[0,-1],v=o.length-1,x=0;function
y(i,m){var
o=b(g[3],d,i[2][2]),l=9===o[0]?o[2].length-1:0;if(v<l)return m;var
f=i[1];if(typeof
f==="number")switch(f){case
0:var
c=j(g[aa],d,i[3],h);break;case
1:var
c=j(g[aa],d,i[3],h);break;case
2:var
c=b(g[74],d,h);break;case
3:var
c=b(g[73],d,h);break;case
4:var
c=bi(d,h);break;default:k[1]=v;var
c=1}else
if(0===f[0])var
c=bn(d,f[1],h);else{var
q=f[1],w=a(g[24],q),r=j(g[b2],d,h,w);if(r)var
s=r;else{var
p=b(g[3],d,h);if(16===p[0])var
u=a(n[70][7],p[1]),t=b(n[19][8][2],u,q);else
var
t=0;var
s=t}var
c=s}if(c){if(a(e[3],k)<l)k[1]=l;return[0,[0,i,l],m]}return m}var
z=j(e[21][18],y,t,x);for(;;){if(0<=a(e[3],k)){var
s=a(e[3],k);k[1]=-1;var
A=as(h,s,o),B=function(q,j){return function(w){var
n=w[2],i=w[1];if(q<=n)var
s=q<n?1:0;else
if(5===i[1]){k[1]=b(e[5],q,1);var
s=0}else{if(a(e[3],k)<n)k[1]=n;var
s=1}if(!s&&b(g[a3][16],d,j))try{var
t=i[1],v=0;if(typeof
t==="number")if(2===t){var
x=function(h){var
f=a7(d,h),i=f[2],c=b(g[95],d,f[1]),j=c[4],k=c[3],l=c[1],m=b(e[23][45],c[2],i),n=[0,a(g[21],[0,l,k,j]),m];return a(g[23],n)},y=i[2],G=y[2],J=y[1],K=x(j);aK(f,d,J,x(G),K)}else
if(5<=t){var
A=function(c){var
d=g[16],e=[0,b(E[4],0,0),d,c];return a(g[21],e)},B=i[2],O=B[2],P=B[1],Q=A(j);aK(f,d,P,A(O),Q)}else
v=1;else
v=1;if(v){var
C=i[2];aK(f,d,C[1],C[2],j)}var
L=a(g[23],[0,i[3],i[4]]);try{var
M=I(f,d,L,j)}catch(b){b=p(b);if(a(m[12],b))throw r;throw b}var
z=as(h,q,o),N=a(i[7],z);throw[0,aj,bl(z,aq(0,f,H,M,i[5],N),i)]}catch(b){b=p(b);if(b[1]===aj){if(a(D,b[2][2]))throw b}else
if(b===u[8]){var
F=a(c[3],cV);return l(m[2],0,0,0,F)}if(a(m[12],b))return 0;throw b}return 0}}(s,A);b(e[21][11],B,z);continue}bg(d,i,h);return b(e[23][13],i,o)}};try{i(w)}catch(b){b=p(b);if(b[1]!==u[6])throw b;var
s=a(c[3],cW);l(m[2],0,0,0,s)}}if(v)var
k=v[1],o=function(c){var
d=a(e[3],k);k[1]=b(e[22],d,[0,c,0]);return 0};else
var
o=function(a){throw[0,aj,a]};h[1]=cX(o,t,f,H,d,w);throw r}catch(b){b=p(b);if(b[1]===aj)return[0,f,0,[0,b[2],0]];var
q=0;if(b!==r&&b!==W)q=1;if(!q&&dk(v)){var
x=a(z[7],v);return[0,f,0,br(a(e[3],x))]}if(b===r&&!K)return a(e[3],h)?at(f,d,C,t,0):at(f,d,C,t,1);if(b===W){if(K)throw r;return at(f,d,C,t,2)}throw b}});if(v)var
F=cZ(D);else
var
T=bq(D),U=a(e[14],T),F=a(e[21][5],U);var
i=F[4],A=i[4],h=F[2];if(a(e[3],x))return w;var
N=i[1],L=0;if(typeof
N==="number")switch(N){case
0:var
o=function(a){return j(g[aa],h,i[3],a)};break;case
1:var
o=function(a){return j(g[aa],h,i[3],a)};break;case
2:var
y=b(g[95],h,i[3]),O=y[4],P=y[2],Q=b(g[a2],[0,y[1],y[3]],f),o=function(e){var
a=b(g[3],d,e);if(8===a[0]){var
i=a[4],c=ai(f,h,P,a[2]);return c?ai(Q,h,O,i):c}return 0};break;case
3:var
o=function(a){return 7===b(g[3],h,a)[0]?ai(f,h,i[3],a):0};break;default:L=1}else
L=1;if(L)var
R=i[3],o=function(a){return ai(f,h,R,a)};var
S=A.length-1;function
B(d,u){var
j=d[1],F=d[2];if(a(e[3],x))return u;var
v=a(aN(h),u),f=v[2],m=v[1];if(S<=f.length-1&&o(m)){var
c=0,C=A.length-1;for(;;){var
n=c===C?1:0;if(n)var
p=n;else{var
D=J(f,c)[1+c],r=ai(j,h,J(A,c)[1+c],D);if(r){var
c=b(e[4],c,1);continue}var
p=r}if(p){var
w=b(e[23][58],A.length-1,f),H=w[2],y=a(g[23],[0,m,w[1]]);q[1]++;if(a(e[3],q)===s)x[1]=k;if(a(e[3],q)<=s)var
E=a(e[3],q),t=b(e[5],E,1),z=J(M,t)[1+t];else
var
z=1-k;var
I=z?l(X,j,i[5],y,F):y,K=function(a){return B(d,a)},L=[0,I,b(e[23][63],K,H)];return a(g[23],L)}break}}function
N(a,c){var
d=c[2],f=c[1],h=0===a[0]?a:[0,a[1],a[3]],i=b(e[4],d,1);return[0,b(g[a2],h,f),i]}function
O(b,a){return B(b,a)}var
P=G(bp[18],j,h,N,O,d,m);function
Q(a){return B(d,a)}var
R=[0,P,b(e[23][63],Q,f)];return a(g[23],R)}return B([0,f,V],w)},O]}function
aR(f,e,d){switch(d[0]){case
0:return a(e,d[1]);case
1:var
g=a(e,d[1]),h=a(c[3],dm);return b(c[12],h,g);case
2:var
i=d[1],j=a(e,d[2]),k=a(c[3],dn),l=a(f,i),m=b(c[12],l,k);return b(c[12],m,j);case
3:var
n=d[1],o=a(e,d[2]),p=a(c[3],dp),q=a(f,n),r=a(c[3],dq),s=b(c[12],r,q),t=b(c[12],s,p);return b(c[12],t,o);case
4:var
u=d[2],v=d[1],w=a(e,d[3]),x=a(c[3],dr),y=a(f,u),z=a(c[3],ds),A=a(e,v),B=b(c[12],A,z),C=b(c[12],B,y),D=b(c[12],C,x);return b(c[12],D,w);default:var
E=d[2],F=d[1],G=a(e,d[3]),H=a(c[3],dt),I=a(f,E),J=a(c[3],du),K=a(e,F),L=b(c[12],K,J),M=b(c[12],L,I),N=b(c[12],M,H);return b(c[12],N,G)}}function
au(c,b){return a(c,a(g[13],b))}function
dD(P,f){var
d=f[2],Q=f[1];function
e(a){return w(P,Q,a)}switch(d[0]){case
0:return e(d[1]);case
1:var
g=e(d[1]),h=a(c[3],dv);return b(c[12],h,g);case
2:var
i=d[1],j=e(d[2]),k=a(c[3],dw),l=au(e,i),m=b(c[12],l,k);return b(c[12],m,j);case
3:var
n=d[1],o=e(d[2]),p=a(c[3],dx),q=au(e,n),r=a(c[3],dy),s=b(c[12],r,q),t=b(c[12],s,p);return b(c[12],t,o);case
4:var
u=d[2],v=d[1],x=e(d[3]),y=a(c[3],dz),z=au(e,u),A=a(c[3],dA),B=e(v),C=b(c[12],B,A),D=b(c[12],C,z),E=b(c[12],D,y);return b(c[12],E,x);default:var
F=d[2],G=d[1],H=e(d[3]),I=a(c[3],dB),J=au(e,F),K=a(c[3],dC),L=e(G),M=b(c[12],L,K),N=b(c[12],M,J),O=b(c[12],N,I);return b(c[12],O,H)}}function
P(c){var
e=c[2],f=c[1],d=a(ag[2],0),g=b(h[20],0,d);function
i(b){var
a=b[2],c=b[1];return a?j(cm,d,g,a[1]):a$(ck,c)}return a_(function(a,b){return a9(f,a,b)},i,e)}function
dE(c){var
e=c[2],f=c[1],d=a(ag[2],0),g=b(h[20],0,d);function
i(b){var
a=b[2],c=b[1];return a?j(cl,d,g,a[1]):a$(cj,c)}return a_(function(a,b){return a9(f,a,b)},i,e)}var
dF=an[6];function
bu(a){return aR(dF,dE,a)}function
bv(c,b,a){return[0,c,[0,O,[0,b]],a]}var
dG=2;function
bw(a,b){return bv(dG,a,b)}function
A(e,a){var
c=a[2][2];if(c&&!a[3]){var
d=c[1],f=a[1];return[0,f,[0,b(dH[6],e,d)[1],[0,d]],0]}return a}function
aS(e,d,o,n){function
f(e,b){if(e){var
d=e[1];if(b){if(d===b[1])return[0,d];var
f=a(c[3],dI);return l(m[2],0,0,0,f)}return[0,d]}return b?[0,b[1]]:0}var
g=e[2],h=g[2],i=e[1],p=g[1];if(h){var
j=d[2][2];if(j){var
q=j[1],r=h[1],s=f(e[3],d[3]);return[0,i,[0,O,[0,b(o,r,q)]],s]}var
t=a(c[3],dJ);return l(m[2],0,0,0,t)}var
k=d[2];if(k[2]){var
u=a(c[3],dK);return l(m[2],0,0,0,u)}var
v=k[1],w=f(e[3],d[3]);return[0,i,[0,b(n,p,v),0],w]}function
Q(d){var
b=d[2],c=b[2],e=b[1];return c?a(bx[9],c[1]):a(dL[26],e)}function
by(w,h){af([ac,function(f){var
d=P(h),e=a(c[3],dM);return b(c[12],e,d)}]);function
e(a){return A(w,bw(a,0))[2]}function
f(e,d,c){var
f=b(u[28],dN,d),g=[0,a(n[1][7],f)],h=0,i=0,j=0===c?O:b(q[3],0,[4,O,c]);return[0,e,[0,ah(O,b(q[3],0,[5,g,0,O,j])),i],h]}function
j(o,n){var
g=bc(0),d=o[1],i=0;if(0===d[0]){var
f=d[1];if(a(N[32],f)){var
h=a(N[34],f);i=1}}if(!i)var
j=a(c[3],cq),h=l(m[2],0,0,0,j);var
k=[4,[0,[0,[0,b(H[1],0,[0,h]),0],cu,g],0],n];return e(ao(0,g,b(H[1],0,k)))[1]}function
Q(b){var
c=1-aG(b);return c?a4(a(bx[9],b),dO):c}var
R=h[2],S=R[2],d=h[1],$=R[1];if(S){var
T=S[1];if(3===d)return A(w,[0,0,[0,$,[0,T]],0]);var
g=T[1];if(18===g[0]){var
U=g[2];if(!U[1]){var
k=U[2];if(K(k,dP))if(K(k,dQ))if(K(k,dR)){if(!K(k,dS)){var
o=g[3],x=o[1];if(x){var
y=x[2];if(y){var
z=y[2];if(z&&!z[2]&&!o[2]&&!o[3]&&!o[4]){var
V=y[1],aa=z[1],ab=x[1];Q(V);var
ad=[0,j(V,aa),0];return f(d,dT,[0,e(ab)[1],ad])}}}}}else{var
r=g[3],B=r[1];if(B){var
C=B[2];if(C&&!C[2]&&!r[2]&&!r[3]&&!r[4]){var
D=C[1],i=B[1];try{var
W=e(i),s=e(D),E=W[1],M=0;if(W[2])if(s[2])var
X=s[1],ae=aG(i)?f(d,dV,[0,E,[0,X,[0,j(i,D),0]]]):f(d,dW,[0,E,[0,X,0]]),Y=ae;else
M=1;else
if(s[2])M=1;else
var
Y=f(d,dY,[0,E,[0,s[1],0]]);if(M)var
ag=a(c[3],dX),Z=l(m[2],0,0,0,ag);else
var
Z=Y;return Z}catch(a){a=p(a);if(aG(i))return f(d,dU,[0,j(i,D),0]);throw a}}}}else{var
t=g[3],F=t[1];if(F){var
G=F[2];if(G){var
I=G[2];if(I&&!I[2]&&!t[2]&&!t[3]&&!t[4]){var
_=G[1],ai=I[1],aj=F[1];Q(_);var
ak=[0,j(_,ai),0];return f(d,dZ,[0,e(aj)[1],ak])}}}}else{var
v=g[3],J=v[1];if(J){var
L=J[2];if(L&&!L[2]&&!v[2]&&!v[3]&&!v[4]){var
al=J[1],am=[0,e(L[1])[1],0];return f(d,d0,[0,e(al)[1],am])}}}}}return A(w,h)}return h}function
d1(b,a){switch(a[0]){case
0:return[0,by(b,a[1])];case
1:return[1,A(b,a[1])];case
2:var
c=a[1];return[2,c,A(b,a[2])];case
3:var
d=a[1];return[3,d,A(b,a[2])];case
4:var
e=a[2],f=a[1],g=A(b,a[3]);return[4,A(b,f),e,g];default:var
h=a[2],i=a[1],j=A(b,a[3]);return[5,A(b,i),h,j]}}function
F(c,a){var
d=a[3],e=a[1];return[0,e,b(d2[3],c,a[2]),d]}function
d3(b,a){switch(a[0]){case
0:return[0,F(b,a[1])];case
1:return[1,F(b,a[1])];case
2:var
c=a[1];return[2,c,F(b,a[2])];case
3:var
d=a[1];return[3,d,F(b,a[2])];case
4:var
e=a[2],f=a[1],g=F(b,a[3]);return[4,F(b,f),e,g];default:var
h=a[2],i=a[1],j=F(b,a[3]);return[5,F(b,i),h,j]}}function
s(b,a){return[0,a[1],a[2],[0,b]]}function
d4(b,p,o,a){switch(a[0]){case
0:return[0,s(b,a[1])];case
1:return[1,s(b,a[1])];case
2:var
c=a[1],d=s(b,a[2]);return[2,s(b,c),d];case
3:var
e=a[1],f=s(b,a[2]);return[3,s(b,e),f];case
4:var
g=a[2],h=a[1],i=s(b,a[3]),j=s(b,g);return[4,s(b,h),j,i];default:var
k=a[2],l=a[1],m=s(b,a[3]),n=s(b,k);return[5,s(b,l),n,m]}}function
d5(a){return a[1]}function
aT(a){return aR(P,P,a)}var
aU=cn(d6,function(b,a){return function(a){return aR(P,P,a)}});function
av(k){var
e=k[2],f=e[2],g=a(q[1],e[1]),d=0;if(f){var
c=f[1][1];switch(c[0]){case
0:var
h=c[1];if(a(N[32],h)){var
b=[0,a(N[34],h)];d=1}break;case
6:if(!c[2]){var
i=c[1][1];if(a(N[32],i)){var
b=[0,a(N[34],i)];d=1}}break}}else
if(0===g[0]){var
j=g[1];if(0===j[0]){var
b=[0,j[1]];d=1}}if(!d)var
b=0;return b?b[1]:a4(Q(k),d7)}function
ax(u,t,f){var
g=f[3],h=f[2],d=h[2],i=h[1];if(d){var
k=d[1];if(g){var
o=n[1][11][1],p=g[1][1],q=function(c,d,a){return b(n[1][11][4],c,a)},r=j(n[1][12][13],q,p,o),e=a8[5];return hu(a8[8],1,u,t,0,0,[0,[0,r,e[2],e[3]]],k)}var
s=a(c[3],cf);return l(m[2],0,0,0,s)}return i}function
d8(b,d,c,a){return s(b,a)}function
ak(f,e,b){var
d=b[3];return d?G(aw[20],0,0,d[1],f,e,b[2]):j(ad,0,0,a(c[3],d9))}function
d_(s,e,d){var
t=a(n[1][11][5],s),l=b(h[28],e,d),u=a(ag[2],0),m=b(h[15],u,l),v=a(h[3],l);try{var
E=a(U[11],m),F=[0,$(C[47],m,e,E,v,t)],f=F}catch(a){a=p(a);if(a[1]!==C[45])throw a;var
f=0}if(f){var
i=f[1],w=i[3],x=i[2],y=i[1],z=[0,b(ea[14],0,1)],o=hv(C[5],z,0,0,0,0,0,d$,0,x,y,w),c=o[2],k=b(h[86],o[1],c),q=b(h[70],d,k),A=b(h[28],k,c),B=[0,c,a(h[16],A)],D=a(g[13],B),r=j(h[37],d,D,k);return q?j(h[71],c,q[1],r):r}return e}function
bz(L,i,k,J,I){af([ac,function(f){var
d=aT(J),e=a(c[3],eb);return b(c[12],e,d)}]);function
x(b,a){return[2,b,a]}function
aq(b,a){return[3,b,a]}function
ar(a){return[1,a]}function
r(a,c,b){var
d=a?a[1]:2;return[0,d,[0,c,0],b]}function
t(d,j,v,h){var
e=d[3];try{var
w=ax(i,k,d),c=a(q[1],w),g=0;switch(c[0]){case
1:var
l=c[1],E=0;if(a(z[2],e)){var
x=a(z[7],e)[1],o=b(n[1][12][3],l,x);if(o)var
r=1-a(z[3],j),s=r?1-a(z[3],L):r;else
var
s=o;if(s){var
y=a(z[7],e)[1],A=b(n[1][12][25],l,y),B=a(z[7],L),C=a(M[6],B),D=b(aw[2][7],C,A),f=b(z[7],j,D);g=1;E=1}}break;case
14:if(2<=c[2]){var
t=c[3],F=0;if(bb(c[1])&&cr(t)){var
u=aH(t),f=b(v,u[1],[0,2,[0,u[2],0],e]);g=1;F=1}}break}if(!g)var
f=a(h,d);return f}catch(b){b=p(b);if(a(m[12],b))return a(h,d);throw b}}function
v(d,c,b,a){return t(r(0,c,d),0,b,a)}function
B(d,j){var
e=a(c[3],ec),f=a(c[3],d),g=a(c[3],ed),h=b(c[12],g,f),i=b(c[12],h,e);return l(m[2],0,0,0,i)}function
N(t,m,s,c){var
v=t[1],n=a(U[10],i),o=a(E[11][4],n),d=[0,0];try{b(E[11][5],m,n);var
A=function(m){var
f=0===a(e[3],d)?1:0;if(f){var
n=b(h[28],c,m),g=a(h[4],n),i=a(E[11][4],g),j=o<i?1:0;if(j){var
p=b(e[5],i,o),q=b(e[5],p,1),r=b(e[21][7],g,q);d[1]=[0,a(E[11][1][2],r)];var
k=0}else
var
k=j;var
l=k}else
var
l=f;return l},q=A,f=d}catch(a){a=p(a);if(a!==u[8])throw a;var
w=[0,[0,m]],q=function(a){return 0},f=w}function
r(d,f){var
i=b(g[3],c,f);if(3===i[0]){var
a=i[1][1];if(!a0(a,v)&&!b(e[21][27],a,d)&&!b(h[32],k,a)){q(a);return[0,a,d]}return d}return l(g[133],c,r,d,f)}var
x=r(0,s);function
y(c,d){if(b(h[41],c,d))return c;var
i=a(e[3],f);if(a(z[3],i))return c;var
j=a(e[3],f),g=a(z[7],j);af([ac,function(b){return a(an[6],g)}]);return d_(g,c,d)}return j(e[21][17],y,c,x)}function
D(c){switch(c[0]){case
0:var
g=c[1],w=g[2];if(w[2])return t(g,[0,D],x,function(a){return[0,a]});var
d=g[3],y=w[1],I=g[1],h=a(q[1],y);if(14===h[0]&&2<=h[2]){var
z=h[3];if(bb(h[1])){var
L=aH(z)[1],A=a(n[1][9],L),C=8<bS(A)?1:0,M=C?o.caml_string_equal(j(aQ[9],A,0,8),ee):C;if(M){var
E=aH(z),N=E[2],f=a(n[1][9],E[1]),O=b(e[5],bS(f),8),F=j(aQ[9],f,8,O),i=a(q[1],N);if(K(F,ef)){if(!K(F,eg)&&4===i[0]){var
k=i[2];if(k){var
l=k[2],m=k[1];if(!l)return v(d,m,x,function(a){return[0,a]});var
p=l[2],G=l[1];if(!p){var
S=function(a){return B(f,a)},T=r(0,m,d);return v(d,G,function(a,b){return[4,T,a,b]},S)}if(!p[2]){var
P=p[1],Q=function(a){return v(d,P,x,function(a){throw[0,bm,eh]})},R=r(0,m,d);return v(d,G,function(a,b){return[4,R,a,b]},Q)}}}}else
if(4===i[0]){var
s=i[2];if(s){var
u=s[2];if(u&&!u[2]){var
U=u[1],V=s[1],W=function(a){return B(f,a)},X=r(0,V,d);return v(d,U,function(a,b){return[5,X,a,b]},W)}}}return B(f,0)}}}var
J=function(a){return[0,a]};return t(r([0,I],y,d),[0,D],x,J);case
1:return t(c[1],0,aq,ar);case
2:var
H=c[1],Y=c[2],Z=function(a){return[2,av(H),a]};return t(Y,0,function(a,b){return[4,H,a,b]},Z);case
3:var
_=c[2];return[3,av(c[1]),_];case
4:var
$=c[3],aa=c[1];return[4,aa,av(c[2]),$];default:var
ab=c[3],ac=c[1];return[5,ac,av(c[2]),ab]}}var
d=D(J);af([ac,function(g){var
e=bu(d),f=a(c[3],ei);return b(c[12],f,e)}]);if(I){var
P=I[1],s=[0,2,P[1],[0,P[2]]];switch(d[0]){case
0:var
R=d[1],as=Q(R),w=[0,aS(R,s,function(a,b){return ao(as,a,b)},ah)];break;case
2:var
aE=d[2],aF=d[1],aG=ax(i,k,s),aI=s[3],w=[5,r(0,ah(O,aG),aI),aF,aE];break;case
4:var
am=d[3],aJ=d[2],aK=d[1],aL=s[3],aM=r(0,ax(i,k,s),aL),aN=Q(am),w=[4,aS(aK,aM,function(a,b){return ao(aN,a,b)},ah),aJ,am];break;case
5:var
ap=d[3],aO=d[2],aP=d[1],aR=s[3],aU=r(0,ax(i,k,s),aR),aV=Q(ap),w=[5,aS(aP,aU,function(a,b){return ao(aV,a,b)},ah),aO,ap];break;default:var
w=d}var
f=w}else
var
f=d;af([ac,function(g){var
d=bu(f),e=a(c[3],ej);return b(c[12],e,d)}]);function
S(a,d,c){var
e=c[3],f=c[2],g=f[2],h=f[1],i=c[1];if(g){var
k=g[1],l=bc(a),j=[5,b(H[1],a,d),l,0,k];return[0,i,[0,h,[0,b(H[1],a,j)]],e]}var
m=[7,d,b(q[3],a,[13,[1,d],0,0]),0,h];return[0,i,[0,b(q[3],a,m),0],e]}switch(f[0]){case
0:var
T=ak(i,k,f[1]);return[0,T[1],[0,T[2]]];case
1:var
V=ak(i,k,f[1]);return[0,V[1],[1,V[2]]];case
2:case
3:var
W=f[1],X=ak(i,k,S(0,[0,W],f[2])),F=X[1],Y=b(g[95],F,X[2]),Z=Y[4],y=b(g[98],F,Y[2]),_=N(y,W,Z,F),at=b(C[25],_,Z),au=a(g[13],y),$=b(g[a3][5],au,at),ay=2===f[0]?[2,y,$]:[3,y,$];return[0,_,ay];default:var
aa=f[2],az=f[1],ab=ak(i,k,S(0,[0,aa],f[3])),G=ab[1],ad=b(g[95],G,ab[2]),ae=ad[4],A=b(g[98],G,ad[2]),ag=N(A,aa,ae,G),aA=b(C[25],ag,ae),aB=a(g[13],A),ai=b(g[a3][5],aB,aA),aj=ak(i,ag,az),al=aj[2],aC=aj[1],aD=4===f[0]?[4,al,A,ai]:[5,al,A,ai];return[0,aC,aD]}}function
bA(d,c,b,a){return bz(0,d,c,[0,b],a)}function
ek(e,d){var
a=d[2];if(0===a[0]){var
c=b(g[3],e,a[1]);return 1===c[0]?[0,c[1]]:0}return 0}function
bB(v,i,m,o,n,r,p){function
q(a){return b(h[32],m,a)}function
e(c,a){return b(ap[16],c,a)}function
w(e,d,k){var
l=b(h[28],e,d),f=a(h[6],l);if(f)var
g=f[1];else
var
n=a(c[3],el),o=a(c[3],em),p=a(c[13],0),q=a(aM[1],d),r=a(c[16],q),s=a(c[3],en),t=G(L[7],0,0,0,i,m,k),u=a(c[3],eo),v=b(c[12],u,t),w=b(c[12],v,s),x=b(c[12],w,r),y=b(c[12],x,p),z=b(c[12],y,o),g=j(ad,0,0,b(c[12],z,n));return[0,b(h[31],e,d),g]}function
k(f,d,a){var
b=a[2],c=a[1],g=ar(c);return bk(0,f,0,d,i,b,0,e(c,b),g)}if(n){var
z=n[1],f=z[2],d=z[1];switch(f[0]){case
4:var
H=f[2],ah=f[3],ai=e(d,f[1]),t=e(d,ah),aj=H[1],ak=a(g[13],H),I=x(0,0,0,m,R,k(eq,q,[0,d,t])),al=I[2],am=I[1],an=[0,d,ak],J=x(0,0,0,d,R,k(0,function(a){return b(h[32],d,a)},an)),ao=J[2],aq=J[1],K=x(0,v,0,m,r,k(0,q,[0,d,ai])),as=K[2],at=K[1],au=l(am,i,o,1,function(b,i,n,g){var
c=X(b,a(h[S],d),i,t),f=w(c,aj,t),j=f[2],k=f[1];function
m(b,d,c,a){return l(at,b,j,a,p)}return e(c,l(aq,b,e(k,t),g,m))}),av=a(as,0)[3][3];a(ao,0);a(al,0);return[0,au,av];case
5:var
M=f[2],aw=f[3],y=e(d,f[1]),u=e(d,aw),ax=M[1],N=a(g[13],M),O=X(i,d,N,y),P=x(0,0,0,m,R,k(er,q,[0,O,e(O,u)])),ay=P[2],az=P[1],aA=[0,d,N],Q=x(0,0,0,d,r,k(0,function(a){return b(h[32],d,a)},aA)),aB=Q[2],aC=Q[1],aD=l(az,i,o,1,function(b,j,n,i){var
c=X(b,a(h[S],d),j,u),f=w(c,ax,u),g=f[1],k=f[2];function
m(a,f,d,c){var
b=e(X(a,g,k,y),y);return l(p,a,b,b,c)}return e(c,l(aC,b,e(g,u),i,m))});a(aB,0);return[0,aD,a(ay,0)[3][3]];case
0:case
1:var
V=e(d,f[1]),T=0,W=a(h[S],d);if(n&&0===n[1][2][0]){var
A=r;T=1}if(!T)var
A=R;var
B=x(0,v,0,m,A,k(0,q,[0,W,V])),Y=B[2],Z=l(B[1],i,o,1,p);return[0,Z,a(Y,0)[3][3]];default:var
C=f[1],s=e(d,f[2]),U=0;if(n&&2===n[1][2][0]){var
D=r;U=1}if(!U)var
D=R;var
_=C[1],$=a(g[13],C),E=x(0,0,0,m,R,k(ep,q,[0,d,s])),aa=E[2],ab=E[1],ac=[0,d,$],F=x(0,v,0,d,D,k(0,function(a){return b(h[32],d,a)},ac)),ae=F[2],af=F[1],ag=l(ab,i,o,1,function(c,j,o,i){var
f=X(c,a(h[S],d),j,s),g=w(f,_,s),k=g[2],m=g[1];function
n(a,c){return b(p,a,k)}return e(f,l(af,c,e(m,s),i,n))});a(ae,0);return[0,ag,a(aa,0)[3][3]]}}var
aE=bf[2];return[0,l(p,i,o,o,1),aE]}function
bC(c){var
b=c[2],d=c[1];switch(b[0]){case
2:return[0,[0,d,a(g[13],b[1])]];case
1:case
3:return 0;default:return[0,[0,d,b[1]]]}}function
bD(o,j){var
e=bC(j);if(e)var
f=e[1],g=f[2],d=f[1];else
var
n=a(c[3],es),i=l(m[2],0,0,0,n),g=i[2],d=i[1];var
k=a(h[bZ],d);return[0,b(C[25],d,g),k]}function
aV(p,f,o,n,d,c,m){if(a0(c,et))var
i=eu,h=0;else
var
i=c,h=1;var
j=[0,0],k=bB(p,f,o,n,[0,d],i,function(l,c,k,d){aO(j,function(a){return c});if(h){var
f=b(e[4],d,m),i=b(e[5],f,1);return a(g[10],i)}return c}),q=k[2],r=k[1],l=a(e[3],j),s=l?l[1]:bD(f,d)[1];return[0,[0,s,q],r]}function
ev(e,a,d,c,m){try{var
k=aV(ew,e,a,d,c,m,1),l=k[1],n=k[2],o=l[2],q=l[1],j=n,i=o,g=q}catch(a){a=p(a);if(a!==r)throw a;var
f=bD(e,c),j=d,i=f[2],g=f[1]}return[0,b(h[164],a,i),g,j]}function
aW(g,f,e,d,c,b,a){var
h=0;return function(i){return bk(g,h,f,e,d,c,b,a,i)}}function
ex(g,f,e,d,c,b,a){return bB(g,f,e,d,c,b,a)[1]}function
ey(f,o,n,e,m,d,k){var
p=d[2],q=d[1];function
r(a){return b(h[32],e,a)}var
s=ar(a(h[S],q)),i=x(0,ez,0,e,n,a(aW(0,0,r,f,p,0,m),s)),t=i[2],u=i[1],v=l(u,f,o,k,function(e,d,c,b){return a(g[10],b)}),j=a(t,0),c=j[3];return[0,c[1],c[2],c[3],c[4],v,j[1]]}function
eA(f,l,k,q,i){var
d=i[2],g=i[1];try{var
e=ey(f,k,q,l,d,[0,g,d],1),A=e[5],B=e[4];if(e[1])var
C=a(c[3],eD),o=j(m[5],0,0,C);else
var
o=[0,A,B];return o}catch(e){e=p(e);if(e===r)try{var
x=function(a){return 1},n=aq(0,f,l,a(h[S],g),d,x),y=n[4];if(n[1])throw r;var
z=[0,k,y];return z}catch(e){var
s=a(c[3],eB),t=w(f,g,d),u=a(c[3],eC),v=b(c[12],u,t);return j(ad,0,0,b(c[12],v,s))}throw e}}function
eE(a){var
c=[0,[0,n[1][12][1],0,aw[3][2]]];return[0,2,[0,b(q[3],0,[0,[0,a],0]),0],c]}function
eF(e){var
c=e[2],d=c[2],b=0,f=a(q[1],c[1]);if(d){if(13===d[1][1][0])b=1}else
if(13===f[0])b=1;return b?1:0}function
bE(a,b,c){return bz([0,aU],a,b,c,0)}var
eK=[0,function(j,d){var
e=d[1],f=a(n[1][7],eJ),h=b(n[1][12][25],f,e),i=a(M[6],aU),u=b(aw[2][7],i,h);function
c(c){var
d=a(v[68][4],c),j=a(v[68][1],c),e=a(v[68][3],c),f=aV(0,e,d,j,bE(e,d,u),R,1),h=f[1][1],k=f[2],i=l(eG[1],0,e,d,h),m=i[2],o=i[1],p=[0,a(n[1][7],eH)],q=[0,b(E[4],p,0),h,m,k],r=a(g[22],q),s=l(eI[3],0,1,r,2),t=a(v[66][1],o);return b(v[73][2],t,s)}return a(v[68][6],c)}];j(bG[16],0,bF,eK);var
eL=b(H[1],0,[29,[0,bF,0],0]),eN=[26,[0,[0,[0,a(n[1][7],eM)],0],eL]],eO=b(H[1],0,eN);function
eP(c){var
b=a(n[1][7],eQ);return $(bG[10],1,0,0,b,eO)}b(ay[11],eP,eR);function
bH(m){function
d(d){var
f=a(v[68][3],d),e=a(v[68][4],d),n=a(v[68][1],d),o=b(ap[16],e,n),g=bA(f,e,m,0),i=g[2],q=g[1],k=0===i[0]?i[1]:j(ad,0,0,a(c[3],eZ));function
s(a){return b(h[32],e,a)}var
t=ar(q),u=x(eT,eS,0,e,0,a(aW(0,0,s,f,k,0,k),t))[1];function
w(f,g,e,x){var
h=a(v[68][4],d),i=G(L[7],0,0,0,f,h,e),j=a(c[13],0),k=a(c[3],eU),l=a(c[13],0),m=a(v[68][4],d),n=G(L[7],0,0,0,f,m,g),o=a(c[13],0),p=a(c[3],eV),q=b(c[12],p,o),r=b(c[12],q,n),s=b(c[12],r,l),t=b(c[12],s,k),u=b(c[12],t,j),w=b(c[12],u,i);b(aE,0,b(c[26],1,w));return e}b(aE,0,a(c[3],eW));try{for(;;){l(u,f,o,1,w);continue}}catch(d){d=p(d);if(d===r){b(aE,0,a(c[3],eX));return eY[3]}throw d}}return a(v[68][6],d)}var
k=[0,aU,d1,d3,d4,aT,function(a){return a},bw,bv,by,F,d8,P];aY(209,[0,P,r,W,dD,aT,bC,bE,bA,ex,aV,ev,Y,ar,aW,x,eA,aO,bq,X,d5,Q,ek,eF,eE,cL,w,a6,bH,k],"Ssrmatching_plugin__Ssrmatching");var
bI=[0,a(t[5],0)];function
e0(b){bI[1]=a(t[5],0);return 0}b(ay[10],e1,e0);a(ay[9],e2);function
Z(c,b,a){return k[5]}function
e3(b,a){return Z}function
e4(b,a){return Z}var
e5=[0,function(b,a){return Z},e4,e3],e6=[2,k[4]],e7=[0,k[3]],e8=k[2],e9=[0,function(a,c){return[0,a,b(e8,a,c)]}],e_=a(M[6],k[1]),e$=[0,a(V[3],e_)],fa=0;function
fb(c,e){var
d=[0,b(k[7],c,0)];return a(k[6],d)}var
fc=a(f[3][1],f[16][3]),fd=b(f[4][2],f[4][1],fc),fe=[0,b(f[6][1],fd,fb),fa];function
ff(c,f,e){var
d=[1,b(k[7],c,0)];return a(k[6],d)}var
fg=a(f[3][1],f[16][3]),fi=a(t[9],fh),fj=a(f[3][10],fi),fk=b(f[4][2],f[4][1],fj),fl=b(f[4][2],fk,fg),fm=[0,b(f[6][1],fl,ff),fe];function
fn(d,h,c,g){var
e=b(k[7],d,0),f=[2,b(k[7],c,0),e];return a(k[6],f)}var
fo=a(f[3][1],f[16][3]),fq=a(t[9],fp),fr=a(f[3][10],fq),fs=a(f[3][1],f[16][3]),ft=b(f[4][2],f[4][1],fs),fu=b(f[4][2],ft,fr),fv=b(f[4][2],fu,fo),fw=[0,b(f[6][1],fv,fn),fm];function
fx(d,i,c,h,g){var
e=b(k[7],d,0),f=[3,b(k[7],c,0),e];return a(k[6],f)}var
fy=a(f[3][1],f[16][3]),fA=a(t[9],fz),fB=a(f[3][10],fA),fC=a(f[3][1],f[16][3]),fE=a(t[9],fD),fF=a(f[3][10],fE),fG=b(f[4][2],f[4][1],fF),fH=b(f[4][2],fG,fC),fI=b(f[4][2],fH,fB),fJ=b(f[4][2],fI,fy),fK=[0,b(f[6][1],fJ,fx),fw];function
fL(e,l,d,j,c,i){var
f=b(k[7],e,0),g=b(k[7],d,0),h=[4,b(k[7],c,0),g,f];return a(k[6],h)}var
fM=a(f[3][1],f[16][3]),fO=a(t[9],fN),fP=a(f[3][10],fO),fQ=a(f[3][1],f[16][3]),fS=a(t[9],fR),fT=a(f[3][10],fS),fU=a(f[3][1],f[16][3]),fV=b(f[4][2],f[4][1],fU),fW=b(f[4][2],fV,fT),fX=b(f[4][2],fW,fQ),fY=b(f[4][2],fX,fP),fZ=b(f[4][2],fY,fM),f0=[0,b(f[6][1],fZ,fL),fK];function
f1(e,l,d,j,c,i){var
f=b(k[7],e,0),g=b(k[7],d,0),h=[5,b(k[7],c,0),g,f];return a(k[6],h)}var
f2=a(f[3][1],f[16][3]),f4=a(t[9],f3),f5=a(f[3][10],f4),f6=a(f[3][1],f[16][3]),f8=a(t[9],f7),f9=a(f[3][10],f8),f_=a(f[3][1],f[16][3]),f$=b(f[4][2],f[4][1],f_),ga=b(f[4][2],f$,f9),gb=b(f[4][2],ga,f6),gc=b(f[4][2],gb,f5),gd=b(f[4][2],gc,f2),ge=[0,[1,[0,b(f[6][1],gd,f1),f0]],e$,e9,e7,e6,e5],bJ=j(al[14],gg,gf,ge),bK=bJ[2],am=bJ[1];function
_(c,b,a){return k[12]}function
gh(b,a){return _}function
gi(b,a){return _}var
gj=[0,function(b,a){return _},gi,gh],gk=[2,k[11]],gl=[0,k[10]],gm=k[9],gn=[0,function(a,c){return[0,a,b(gm,a,c)]}],go=0,gp=0;function
gq(a,d,c){return b(k[7],a,0)}var
gr=a(f[3][1],f[16][1]),gt=a(t[9],gs),gu=a(f[3][10],gt),gv=b(f[4][2],f[4][1],gu),gw=b(f[4][2],gv,gr),gx=[0,[1,[0,b(f[6][1],gw,gq),gp]],go,gn,gl,gk,gj],bL=j(al[14],gz,gy,gx),bM=bL[2],aX=bL[1],gD=[0,function(d){var
a=b(gA[12],0,d);if(typeof
a!=="number"&&0===a[0]){var
c=a[1];if(!K(c,gB))return 0;if(!K(c,gC))return 1}return 2}],bN=b(f[2][5],gE,gD),gF=0;function
gG(b,a,d){var
c=j(k[8],a,b,0);if(aZ(Q(c),[0,d])&&0===a)return j(k[8],3,b,0);return c}var
gH=a(f[3][1],f[16][1]),gI=a(f[3][1],bN),gJ=b(f[4][2],f[4][1],gI),gK=b(f[4][2],gJ,gH),gL=[0,0,[0,b(f[6][1],gK,gG),gF]];j(bO[3],gM,bM,gL);function
gN(b,a){return _}function
gO(b,a){return _}var
gP=[0,function(b,a){return _},gO,gN],gQ=[2,k[11]],gR=[0,k[10]],gS=k[9],gT=[0,function(a,c){return[0,a,b(gS,a,c)]}],gU=a(M[6],aX),gV=[0,a(V[3],gU)],gW=0;function
gX(a,d,c){return b(k[7],a,0)}var
gY=a(f[3][1],f[16][3]),g0=a(t[9],gZ),g1=a(f[3][10],g0),g2=b(f[4][2],f[4][1],g1),g3=b(f[4][2],g2,gY),g4=[0,[1,[0,b(f[6][1],g3,gX),gW]],gV,gT,gR,gQ,gP],bP=j(al[14],g6,g5,g4),bQ=bP[2],g7=bP[1],g8=0;function
g9(b,a,d){var
c=j(k[8],a,b,0);if(aZ(Q(c),[0,d])&&0===a)return j(k[8],3,b,0);return c}var
g_=a(f[3][1],f[16][3]),g$=a(f[3][1],bN),ha=b(f[4][2],f[4][1],g$),hb=b(f[4][2],ha,g_),hc=[0,0,[0,b(f[6][1],hb,g9),g8]];j(bO[3],hd,bQ,hc);function
he(b,a){return Z}function
hf(b,a){return Z}var
hg=[0,function(b,a){return Z},hf,he],hh=a(M[6],am),hi=[0,[0,bK],[0,a(V[3],hh)],[1,am],[1,am],[1,am],hg];j(al[14],hk,hj,hi);var
hl=0;function
hm(a,b){return bH(a)}var
ho=[0,[0,[0,hn,[1,[5,a(M[16],aX)],0]],hm],hl];$(al[11],hq,hp,0,0,ho);function
hr(b){return a(t[4],bI[1])}b(ay[10],hs,hr);aY(215,[0,bM,aX,bQ,g7,bK,am],"Ssrmatching_plugin__G_ssrmatching");return hx});

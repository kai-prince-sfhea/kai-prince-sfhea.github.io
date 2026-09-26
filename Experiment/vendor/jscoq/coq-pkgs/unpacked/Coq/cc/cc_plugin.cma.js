(function(eX){"use strict";var
eY={},aL=".",bO="  [",bL=" : ",bR=915186972,p=246,a4=3901498,bN="simple",bQ="[",at="congruence",a6=-431191102,bK="A",as=1000,bV="with",aN="]",aM=136,au=15500,bM=-318868643,bP=" and ",bU=167,a2=137,a3="coq-core.plugins.cc",bT=125,bJ=114,a1=888453194,a5=-912009552,bS="Heq",bI="f_equal",B=250,z=eX.jsoo_runtime,o=z.caml_check_bound,ar=z.caml_int_compare,aI=z.caml_make_vect,A=z.caml_obj_tag,aq=z.caml_register_global,d=z.caml_string_of_jsbytes,r=z.caml_wrap_exception;function
a(a,b){return a.length==1?a(b):z.caml_call_gen(a,[b])}function
b(a,b,c){return a.length==2?a(b,c):z.caml_call_gen(a,[b,c])}function
j(a,b,c,d){return a.length==3?a(b,c,d):z.caml_call_gen(a,[b,c,d])}function
E(a,b,c,d,e){return a.length==4?a(b,c,d,e):z.caml_call_gen(a,[b,c,d,e])}function
ag(a,b,c,d,e,f){return a.length==5?a(b,c,d,e,f):z.caml_call_gen(a,[b,c,d,e,f])}function
aJ(a,b,c,d,e,f,g){return a.length==6?a(b,c,d,e,f,g):z.caml_call_gen(a,[b,c,d,e,f,g])}function
aK(a,b,c,d,e,f,g,h){return a.length==7?a(b,c,d,e,f,g,h):z.caml_call_gen(a,[b,c,d,e,f,g,h])}function
bH(a,b,c,d,e,f,g,h,i,j,k,l){return a.length==11?a(b,c,d,e,f,g,h,i,j,k,l):z.caml_call_gen(a,[b,c,d,e,f,g,h,i,j,k,l])}var
h=z.caml_get_global_data(),f=h.Util,n=h.Stdlib,k=h.Names,e=h.EConstr,l=h.Constr,am=h.Retyping,g=h.Int,x=h.Stdlib__queue,c=h.Pp,aR=h.Control,Q=h.CErrors,T=h.Stdlib__stack,a_=h.Term,bp=h.Environ,I=h.Context,bn=h.Assert_failure,al=h.Printer,w=h.CamlinternalLazy,ab=h.Hashset,a9=h.Sorts,ah=h.Stdlib__hashtbl,aX=h.Termops,bx=h.Evarutil,m=h.Tacticals,i=h.Proofview,s=h.Tacmach,y=h.Tactics,U=h.Typing,bA=h.Evarsolve,by=h.Refine,bD=h.DAst,O=h.Coqlib,bw=h.Equality,bu=h.CClosure,aW=h.Reductionops,aH=h.Option,ae=h.Stdarg,af=h.Genarg,bG=h.Ltac_plugin__Tacentries,dh=h.Vars,df=h.Namegen,bW=h.CDebug,dS=h.Global,dT=h.Inductiveops,et=h.Pretype_errors,eu=h.Type_errors,ef=h.Detyping,d2=h.Evd,ew=h.Mltop;aq(bT,[0],"Cc_plugin");var
q=b(bW[1],d(at),0),dp=d("Out of depth ... "),dn=d("Out of instances ... "),dq=d("First run was incomplete, completing ... "),dm=d("Executing ... "),dl=d("Running E-matching algorithm ... "),dj=d("paf_of_patt: pattern with variable head"),dg=d("wrong incomplete class."),c$=d(" ... "),da=d(" = "),db=d("Checking if "),c_=d("Yes"),dc=d("No"),c7=d(aL),c8=d("Processing mark for term "),c4=d("weird error in injection subterms merge."),c5=[0,d("add_pacs")],c2=d(aL),c3=d("Updating term "),cZ=d(aL),c0=d(bP),c1=d("Merging "),cV=d(aL),cW=d(bP),cX=d("Linking "),cU=[0,d("_vendor+v8.17+32bit/coq/plugins/cc/ccalgo.ml"),686,2],cO=d(aN),cP=d(" <> "),cQ=d(bL),cR=d(bO),cS=d("Adding new disequality, depth="),cJ=d(aN),cK=d(" == "),cL=d(bL),cM=d(bO),cN=d("Adding new equality, depth="),cI=d("discarding redundant (dis)equality"),cF=d(aN),cG=d(bQ),cC=d(aN),cD=d(":="),cE=d(bQ),cB=d("incomplete matching."),cy=d("not a node."),cz=[0,d("subterms")],cr=d("not a constructor."),cs=[0,d("get_constructor")],cp=d("not a representative."),cq=[0,d("get_representative")],ck=d("not enough args."),cl=[0,d("nth_arg")],b2=d("signature already entered."),b3=[0,d("enter")],b$=d(bK),cb=d(bK),cw=d("Cc_plugin.Ccalgo.Discriminable"),dd=d("_eps_"),dr=[0,1,20],ds=d("equal_proof "),dt=[0,1,20],du=d("edge_proof "),dv=[0,1,20],dw=d("constr_proof "),dy=d(","),dx=d("}"),dz=d("{"),dA=[0,1,20],dB=d("path_proof "),dC=[0,1,20],dD=d("congr_proof "),dE=[0,1,20],dF=d("ind_proof "),dR=[0,0],dZ=[0,d("_vendor+v8.17+32bit/coq/plugins/cc/cctac.ml"),273,9],d3=d("f"),d4=d("I don't know how to handle dependent equality"),er=[0,0],ei=d("("),ej=d(")"),ee=[0,1],ec=d("Goal solved, generating proof ..."),eb=d("Computation completed."),ea=d("Problem built, solving ..."),d$=d("Reading goal ..."),ed=[13,0,0,0],eg=d("  replacing metavariables by arbitrary terms"),eh=d(')",'),ek=d('"congruence with ('),el=d("  Try "),em=d("Goal is solvable by congruence but some arguments are missing."),en=d("simple congruence failed"),eo=d("congruence failed"),d_=d(bS),d9=d("H"),d7=d("e"),d8=d("X"),d5=d(bS),d0=[0,0],d1=[0,1],dY=d("t"),dV=[0,0],dU=[0,0],dP=d("core.not.type"),dO=d("core.False.type"),dN=d("core.eq.type"),dM=d("core.eq.trans"),dK=d("core.eq.sym"),dJ=d("core.eq.refl"),dH=d("core.eq.rect"),dG=d("core.eq.congr"),ev=d(a3),ez=d(bV),eB=d(at),eC=d(bN),eF=d(at),eG=d(bN),eJ=d(bV),eL=d(at),eO=d(at),eQ=d("cc"),eR=d(a3),eT=[0,d(bI),0],eV=d(bI),eW=d(a3),X=5,bX=g[1],bY=[0,function(b,a){return b===a?1:0},bX],av=a(ah[26],bY);function
bZ(b,a){var
c=b[1]===a[1]?1:0,d=a[2],e=b[2],f=c?e===d?1:0:c;return f}var
b0=[0,bZ,function(c){var
d=c[1],e=a(g[1],c[2]),f=a(g[1],d);return b(ab[2][1],f,e)}],ai=a(ah[26],b0);function
b1(f,e,d){if(b(ai[11],d[1],e)){var
g=a(c[3],b2);E(Q[2],0,0,b3,g)}else
j(ai[10],d[1],e,f);return j(av[10],d[2],f,e)}function
b4(c,a){return b(ai[7],a[1],c)}function
b5(a,c){try{var
d=b(av[7],a[2],c);b(ai[6],a[1],d);var
e=b(av[6],a[2],c);return e}catch(a){a=r(a);if(a===n[8])return 0;throw a}}function
b6(c,a){function
d(a){return b5(c,a)}return b(g[2][14],d,a)}var
b7=[0,function(b,a){var
c=ar(b[1],a[1]),e=a[3],g=a[2],h=b[3],i=b[2];if(0===c){var
d=ar(i,g);return 0===d?j(f[21][49],ar,h,e):d}return c}],b8=[0,function(b,a){var
c=ar(b[1],a[1]),d=a[2],e=b[2];return 0===c?ar(e,d):c}],M=a(f[25][1],b7),H=a(f[25][1],b8);function
a7(c,a){var
b=0;if(typeof
c==="number")switch(c){case
1:if(typeof
a==="number"&&1===a)b=1;break;case
2:if(typeof
a==="number"&&2<=a)b=1;break}else
if(typeof
a!=="number")b=1;return b?1:0}function
a8(n,m){var
c=n,a=m;for(;;){switch(c[0]){case
0:if(0===a[0])return b(l[87],c[1],a[1]);break;case
1:if(1===a[0]){var
o=a[2],p=c[2],f=a7(c[1],a[1]);return f?a7(p,o):f}break;case
2:if(2===a[0])return b(k[1][1],c[1],a[1]);break;case
3:if(3===a[0]){var
q=a[2],r=c[2],g=a8(c[1][1],a[1][1]);if(g){var
c=r[1],a=q[1];continue}return g}break;default:if(4===a[0]){var
d=a[1],e=c[1],h=e[2]===d[2]?1:0,s=d[3],t=d[1][1],u=e[3],v=e[1][1];if(h){var
i=u===s?1:0;if(i)return b(k[30][2][2],v,t);var
j=i}else
var
j=h;return j}}return 0}}function
b9(b,a){return a8(b[1],a[1])}function
b_(a){return a[3]}var
ca=[0,a(k[1][7],b$)],cc=[0,a(k[1][7],cb)],cd=a(l[1],2),ce=a(l[1],2),cf=[0,b(I[4],0,0),ce,cd],cg=a(l[14],cf);function
Y(d){var
b=d[2],c=A(b);return B===c?b[1]:p===c?a(w[2],b):b}function
aj(c){switch(c[0]){case
0:var
f=a(l[bJ],c[1]),d=b(ab[2][1],1,f);break;case
1:var
g=c[1],h=a(a9[8],c[2]),i=a(a9[8],g),d=j(ab[2][3],2,i,h);break;case
2:var
m=a(k[1][3],c[1]),d=b(ab[2][1],3,m);break;case
3:var
d=j(ab[2][3],4,c[1][3],c[2][3]);break;default:var
e=c[1],n=e[3],o=e[2],q=a(k[30][2][3],e[1][1]),d=E(ab[2][4],5,q,o,n)}return[0,c,[p,function(D){switch(c[0]){case
0:return c[1];case
1:var
t=c[1],n=a(l[8],c[2]),o=[0,b(I[4],cc,0),n,cg],q=a(l[15],o),r=a(l[8],t),s=[0,b(I[4],ca,0),r,q];return a(l[15],s);case
2:return a(l[2],c[1]);case
3:var
d=c[2][2],u=c[1],j=A(d),v=0,x=B===j?d[1]:p===j?a(w[2],d):d,h=[0,x,v],g=u;for(;;){var
i=g[1];if(3===i[0]){var
f=i[2][2],z=i[1],m=A(f),C=B===m?f[1]:p===m?a(w[2],f):f,h=[0,C,h],g=z;continue}var
e=g[2],k=A(e),y=B===k?e[1]:p===k?a(w[2],e):e;return a(a_[12],[0,y,h])}default:return a(l[25],c[1][1])}}],d]}function
a$(a){return aj([0,a])}function
ch(a){return aj([1,a[1],a[2]])}function
aw(a){return aj([3,a[1],a[2]])}function
ci(a){return aj([4,a])}function
cj(i,h){var
g=i,d=h;for(;;){var
e=g[1];if(3===e[0]){var
k=e[2],l=e[1];if(0<d){var
g=l,d=b(f[5],d,1);continue}return k}var
j=a(c[3],ck);return E(Q[2],0,0,cl,j)}}function
cm(a){return a}var
N=a(ah[26],[0,l[87],l[bJ]]),ac=a(ah[26],[0,b9,b_]),aO=a(ah[26],[0,k[1][1],k[1][3]]),cn=a$(a(l[1],n[20])),ba=[0,[1,n[20],[0,n[20],n[20],0]],n[20],M[1],0,cn];function
bb(h,f,e){var
i=a(N[1],X),j=a(aO[1],X),k=g[2][1],l=a(x[2],0),m=a(x[2],0),n=g[2][1],b=a(av[1],X),c=[0,a(ai[1],X),b],d=a(ac[1],X);return[0,[0,X,0,aI(5,ba),a(N[1],X),0,d],c,n,m,l,0,0,k,j,e,0,i,h,f]}function
co(a){return a[1]}function
F(e,h){var
c=0,a=h;for(;;){var
d=o(e[3],a)[1+a][2];if(0<=d){var
c=[0,a,c],a=d;continue}var
g=function(b){o(e[3],b)[1+b][2]=a;return 0};b(f[21][11],g,c);return a}}function
R(e,b){var
d=o(e[3],b)[1+b][1];if(0===d[0])return d[1];var
f=a(c[3],cp);return E(Q[2],0,0,cq,f)}function
bc(b,a){return o(b[3],a)[1+a][3]}function
bd(c,f,e){var
a=f;for(;;)try{var
g=bc(c,a),h=b(M[25],e,g);return h}catch(b){b=r(b);if(b===n[8]){var
d=o(c[3],a)[1+a][1];if(0===d[0])throw n[8];var
a=d[1];continue}throw b}}function
ak(e,b){var
d=o(e[3],b)[1+b][5][1];if(4===d[0])return d[1];var
f=a(c[3],cr);return E(Q[2],0,0,cs,f)}function
be(b,a){return R(b,a)[1]}function
aP(c,a){return b(N[7],c[4],a)}function
ct(a){return a[5]}function
cu(e,d,c){var
a=R(e,d);a[1]=b(f[4],a[1],1);a[2]=b(g[2][4],c,a[2]);a[3]=b(g[2][4],c,a[3]);return 0}var
bf=[248,cw,z.caml_fresh_oo_id(0)];function
cv(e,d,c){var
a=R(e,d);a[1]=b(f[4],a[1],1);a[3]=b(g[2][4],c,a[3]);return 0}function
bg(b){var
c=a(f[21][6],b[3]);return[0,b[1],b[2]+1|0,c]}function
cx(a,c,e){try{var
i=b(H[25],c,a[6]),d=i}catch(a){a=r(a);if(a!==n[8])throw a;var
d=g[2][1]}var
f=a[6],h=b(g[2][4],e,d);a[6]=j(H[4],c,h,f);return 0}function
J(b,a){return o(b[3],a)[1+a][5]}function
ad(f,b){var
d=o(f[3],b)[1+b][4];if(d){var
e=d[1];return[0,e[1],e[2]]}var
g=a(c[3],cy);return E(Q[2],0,0,cz,g)}function
bh(a,c){var
b=ad(a,c),d=b[1],e=F(a,b[2]);return[0,F(a,d),e]}function
cA(a){var
c=a[2],d=c+1|0;if(d===a[1]){var
e=b(f[4],(a[1]*3|0)/2|0,1),g=aI(e,ba);a[1]=e;ag(f[23][10],a[3],0,g,0,c);a[3]=g}a[2]=d;return c}function
ax(a){return[0,0,g[2][1],g[2][1],0,a,H[1]]}function
bi(p){var
g=a(e[bU][1],p);function
d(b){return bi(a(e[9],b))}var
c=a(l[31],g);switch(c[0]){case
6:var
q=c[2],r=c[1],s=d(c[3]),t=[0,r,d(q),s];return a(l[14],t);case
7:var
u=c[2],v=c[1],w=d(c[3]),x=[0,v,d(u),w];return a(l[15],x);case
8:var
y=c[3],z=c[2],A=c[1],B=d(c[4]),C=d(y),D=[0,A,d(z),C,B];return a(l[16],D);case
9:var
E=c[1],F=b(f[23][75][1],d,c[2]),G=[0,d(E),F];return a(l[17],G);case
10:var
h=c[1],H=h[2],I=a(k[19][5],h[1]),J=[0,a(k[19][2],I),H];return a(l[20],J);case
11:var
i=c[1],j=i[1],K=i[2],L=j[2],M=a(k[25][5],j[1]),N=[0,[0,a(k[25][2],M),L],K];return a(l[23],N);case
12:var
m=c[1],n=m[1],o=n[1],O=m[2],P=n[2],Q=o[2],R=a(k[25][5],o[1]),S=[0,[0,[0,a(k[25][2],R),Q],P],O];return a(l[25],S);case
16:var
T=c[2],U=c[1],V=function(b){var
c=a(k[25][5],b);return a(k[25][2],c)},W=b(k[70][20],V,U),X=[0,W,d(T)];return a(l[21],X);default:return g}}function
ay(b,a){if(0===a[0]){var
d=a[2],e=a[1],g=function(c,a){return aw([0,a,ay(b,c)])};return j(f[21][18],g,d,e)}var
c=a[1]-1|0,h=a[2],i=o(b,c)[1+c];function
k(c,a){return aw([0,a,ay(b,c)])}return j(f[21][18],k,h,i)}function
u(h,g,f,d){var
i=a(c[3],cC),j=Y(J(f,d)),k=a(e[9],j),l=aJ(al[7],0,0,0,h,g,k),m=a(c[3],cD),n=a(c[16],d),o=a(c[3],cE),p=b(c[12],o,n),q=b(c[12],p,m),r=b(c[12],q,l);return b(c[12],r,i)}function
az(g,f,d){var
h=a(c[3],cF),i=Y(d),j=a(e[9],i),k=aJ(al[7],0,0,0,g,f,j),l=a(c[3],cG),m=b(c[12],l,k);return b(c[12],m,h)}function
S(d,f){var
h=d[1];try{var
k=b(ac[7],h[6],f);return k}catch(k){k=r(k);if(k===n[8]){var
c=cA(h),t=Y(f),u=a(e[9],t),i=bi(ag(am[2],0,0,d[13],d[14],u)),l=f[1];switch(l[0]){case
2:var
z=M[1],m=[0,[0,ax(i)],-1,z,0,f];break;case
3:var
A=l[2],q=S(d,l[1]),s=S(d,A);cu(h,F(h,q),c);cv(h,F(h,s),c);d[3]=b(g[2][4],c,d[3]);var
B=M[1],m=[0,[0,ax(i)],-1,B,[0,[0,q,s]],f];break;case
4:var
C=l[1];b(x[3],[0,c,[0,[0,c,0]]],d[5]);b(x[3],[0,c,[1,[0,c,C[2],0]]],d[5]);var
D=M[1],m=[0,[0,ax(i)],-1,D,0,f];break;default:b(x[3],[0,c,[0,[0,c,0]]],d[5]);var
v=M[1],m=[0,[0,ax(i)],-1,v,0,f]}o(h[3],c)[1+c]=m;j(ac[5],h[6],f,c);try{var
y=b(N[7],d[12],i),p=y}catch(a){a=r(a);if(a!==n[8])throw a;var
p=g[2][1]}var
w=b(g[2][4],c,p);j(N[10],d[12],i,w);return c}throw k}}function
bj(a,e,d,c){var
f=S(a,d),g=S(a,c);b(x[3],[0,f,g,[0,e,0]],a[4]);return j(N[5],a[1][4],e,[0,d,c])}function
bk(e,d,c,b){return bj(e,a(l[2],d),c,b)}function
Z(a,d,c,b){var
e=S(a,c),f=S(a,b);a[6]=[0,[0,e,f,d],a[6]];return 0}function
aQ(b,d,c,a){b[7]=[0,[0,d,c,a[1],a[3],a[2],a[5],a[4]],b[7]];return 0}function
cH(a,d,c){try{var
e=a[1],g=function(a){return F(e,a)},h=b(f[23][15],g,c),i=b(aO[9],a[9],d),k=function(b){function
c(c,b){return c===F(a[1],b)?1:0}return j(f[23][37],c,h,b)},l=b(f[21][24],k,i);return l}catch(a){a=r(a);if(a===n[8])return 0;throw a}}function
cT(e,b,a,d){var
c=o(e[3],b)[1+b];c[1]=[1,a,d];c[2]=a;return 0}function
bl(g,f,e){var
a=f,b=e;for(;;){var
c=o(g[3],a)[1+a][1];if(0===c[0])return b;var
d=c[1],h=[0,[0,[0,a,d],c[2]],b],a=d,b=h;continue}}function
bm(c,i,h){var
o=F(c,h);if(F(c,i)===o){var
p=bl(c,h,0),a=[0,bl(c,i,0),p];for(;;){var
b=a[1];if(b){var
d=a[2];if(d){var
f=d[1][1],g=b[1][1],e=g[1]===f[1]?1:0,m=d[2],n=b[2],j=f[2],k=g[2],l=e?k===j?1:0:e;if(l){var
a=[0,n,m];continue}return a}return[0,b,0]}return[0,0,a[2]]}}throw[0,bn,cU]}function
bo(d,h,k,v){a(q,function(o){var
e=a(c[3],cV),f=u(d[13],d[14],d[1],k),g=a(c[3],cW),i=u(d[13],d[14],d[1],h),j=a(c[3],cX),l=b(c[12],j,i),m=b(c[12],l,g),n=b(c[12],m,f);return b(c[12],n,e)});var
i=R(d[1],h),e=R(d[1],k);cT(d[1],h,k,v);try{var
D=b(N[7],d[12],i[5]),s=D}catch(a){a=r(a);if(a!==n[8])throw a;var
s=g[2][1]}var
w=b(g[2][6],h,s);j(N[10],d[12],i[5],w);var
t=b(g[2][7],i[3],e[3]);e[1]=a(g[2][22],t);e[3]=t;e[2]=b(g[2][7],i[2],e[2]);b6(d[2],i[3]);d[3]=b(g[2][7],d[3],i[3]);var
y=o(d[1][3],h)[1+h][3];function
z(c,a){return b(x[3],[0,a,[1,c]],d[5])}b(M[12],z,y);var
A=i[6];function
B(c){function
e(a){return b(x[3],[0,a,[0,c]],d[5])}return a(g[2][14],e)}b(H[12],B,A);var
l=i[4],f=e[4];if(typeof
l==="number"){if(0===l)return 0;if(typeof
f==="number"){if(0===f){e[4]=1;return 0}}else
if(0===f[0]){d[8]=b(g[2][6],k,d[8]);e[4]=1;return 0}}else
if(0===l[0]){var
p=0,C=l[1];if(typeof
f==="number"){if(0===f){e[4]=[0,C];d[8]=b(g[2][6],h,d[8]);d[8]=b(g[2][4],k,d[8]);return 0}p=1}else
if(1!==f[0])p=1;if(p){d[8]=b(g[2][6],h,d[8]);return 0}}else{var
m=l[1];if(typeof
f==="number"){if(0===f){e[4]=[1,m];return 0}}else
if(0!==f[0])return b(x[3],[0,m[1],[1,m[2]]],d[5])}return 0}function
cY(f,e){a(q,function(n){var
d=a(c[3],cZ),g=u(e[13],e[14],e[1],f[2]),h=a(c[3],c0),i=u(e[13],e[14],e[1],f[1]),j=a(c[3],c1),k=b(c[12],j,i),l=b(c[12],k,h),m=b(c[12],l,g);return b(c[12],m,d)});var
g=e[1],h=F(g,f[1]),i=F(g,f[2]),j=1-(h===i?1:0);if(j){var
l=be(g,i);if(be(g,h)<l)return bo(e,h,i,f);var
d=f[3],k=typeof
d==="number"?0:0===d[0]?[0,d[1],1-d[2]]:[1,d[3],d[4],d[1],d[2],d[5]];return bo(e,i,h,[0,f[2],f[1],k])}return j}function
c6(h,t,d){a(q,function(j){var
e=a(c[3],c7),f=u(d[13],d[14],d[1],h),g=a(c[3],c8),i=b(c[12],g,f);return b(c[12],i,e)});var
r=F(d[1],h),i=R(d[1],r);if(0===t[0]){cx(i,t[1],h);d[3]=b(g[2][7],i[2],d[3]);return 0}var
e=t[1],s=o(d[1][3],r)[1+r];if(1-b(M[3],e,s[3]))s[3]=j(M[4],e,h,s[3]);var
k=i[4];if(typeof
k==="number"){if(0===k)return 0===e[2]?(i[4]=[1,[0,h,e]],0):(d[3]=b(g[2][7],i[2],d[3]),i[4]=[0,e],d[8]=b(g[2][4],r,d[8]),0)}else
if(1===k[0]){var
v=k[1],l=v[2],w=v[1];if(e[1]===l[1]){var
z=ak(d[1],e[1]),p=z[3],n=l[3],m=e[3];for(;;){var
y=0<p?1:0;if(y){if(n&&m){var
A=m[2],B=n[2];b(x[3],[0,n[1],m[1],[1,w,l,h,e,p]],d[4]);var
p=b(f[5],p,1),n=B,m=A;continue}var
C=a(c[3],c4);return E(Q[2],0,0,c5,C)}return y}}throw[0,bf,w,l,h,e]}d[3]=b(g[2][7],i[2],d[3]);return 0}function
c9(d){var
g=d[1];function
h(f){if(f){var
e=f[1],k=f[2],l=F(g,e[2]);if(F(g,e[1])===l)var
j=[0,e],i=a(c[3],c_);else
var
m=h(k),j=m,i=a(c[3],dc);a(q,function(p){var
f=a(c[3],c$),g=u(d[13],d[14],d[1],e[2]),h=a(c[3],da),j=u(d[13],d[14],d[1],e[1]),k=a(c[3],db),l=b(c[12],k,j),m=b(c[12],l,h),n=b(c[12],m,g),o=b(c[12],n,f);return b(c[12],o,i)});return j}return 0}return h(d[6])}var
de=a(k[1][7],dd);function
di(d){var
h=d[8];function
i(o){var
i=R(d[1],o)[4];if(typeof
i!=="number"&&0===i[0]){var
g=i[1],z=Y(J(d[1],g[1])),A=a(e[9],z),B=ag(am[2],0,0,d[13],d[14],A),C=a(e[bU][1],B),D=g[3],F=function(a){return Y(J(d[1],a))},G=b(f[21][73],F,D),H=a(f[21][9],G),K=b(a_[30],C,H),L=g[2],k=J(d[1],o),m=K,j=L;for(;;){if(0<j){var
n=a(l[69],m),u=n[3],v=a(e[9],n[2]),p=a(bp[11],d[13]),q=a(bp[34],p),h=b(df[26],de,q),r=d[13],s=[0,b(I[4],h,0),v];d[13]=b(e[140],s,r);var
w=b(f[5],j,1),x=[0,a(l[2],h),0],y=b(dh[15],x,u),k=aw([0,k,aj([2,h])]),m=y,j=w;continue}d[1][5]=[0,g,d[1][5]];S(d,k);return 0}}var
t=a(c[3],dg);return E(Q[2],0,0,0,t)}return b(g[2][14],i,h)}function
bq(d,c){if(0===c[0]){var
e=c[1],g=a(f[21][1],c[2]);return[0,b(ac[7],d,e),g]}return a(n[1],dj)}function
dk(c){var
l=c[1][6],h=a(T[2],0),d=[0,H[1]],i=c[1],e=c[1][3];function
m(c,k){var
e=c<i[2]?1:0;if(e){var
h=k[1];if(0===h[0]){var
l=h[1][6],m=function(e,o){try{var
l=a(f[3],d),m=b(H[25],e,l),h=m}catch(a){a=r(a);if(a!==n[8])throw a;var
h=g[2][1]}var
i=a(f[3],d),k=b(g[2][4],c,h);d[1]=j(H[4],e,k,i);return 0};return b(H[12],m,l)}return 0}return e}b(f[23][14],m,e);var
k=a(f[3],d);function
o(a){var
f=a[5];if(typeof
f==="number")if(f)var
d=g[2][1];else
try{var
v=bq(l,a[4]),w=b(H[25],v,k),d=w}catch(a){a=r(a);if(a!==n[8])throw a;var
d=g[2][1]}else{var
x=f[1];try{var
y=b(N[7],c[12],x),m=y}catch(a){a=r(a);if(a!==n[8])throw a;var
m=g[2][1]}var
d=m}function
o(c){return b(T[3],[0,aI(a[3],-1),a,[0,[0,a[4],c],0]],h)}b(g[2][14],o,d);var
i=a[7];if(typeof
i==="number")if(i)var
e=g[2][1];else
try{var
q=bq(l,a[6]),s=b(H[25],q,k),e=s}catch(a){a=r(a);if(a!==n[8])throw a;var
e=g[2][1]}else{var
t=i[1];try{var
u=b(N[7],c[12],t),j=u}catch(a){a=r(a);if(a!==n[8])throw a;var
j=g[2][1]}var
e=j}function
p(c){return b(T[3],[0,aI(a[3],-1),a,[0,[0,a[6],c],0]],h)}return b(g[2][14],p,e)}b(f[21][11],o,c[7]);return h}function
aA(U,d){a(q,function(b){return a(c[3],dm)});try{for(;;){a(aR[4],0);try{cY(a(x[5],d[4]),d);var
ag=1,w=ag}catch(e){e=r(e);if(e!==x[1])throw e;try{var
L=a(x[5],d[5]);c6(L[1],L[2],d);var
af=1,w=af}catch(e){e=r(e);if(e!==x[1])throw e;try{var
i=a(g[2][28],d[3]);d[3]=b(g[2][6],i,d[3]);a(q,function(i){return function(j){var
e=a(c[3],c2),f=u(d[13],d[14],d[1],i),g=a(c[3],c3),h=b(c[12],g,f);return b(c[12],h,e)}}(i));var
z=bh(d[1],i),A=z[1],W=ad(d[1],i)[2],B=R(d[1],A),aD=0,K=B[4];if(typeof
K!=="number"&&0===K[0]){B[4]=1;d[8]=b(g[2][6],A,d[8]);aD=1}var
X=bc(d[1],A),_=function(c,e){return function(a,f){return b(x[3],[0,e,[1,[0,a[1],a[2]-1|0,[0,c,a[3]]]]],d[5])}}(W,i);b(M[12],_,X);var
$=B[6],aa=function(c){return function(a,e){return b(x[3],[0,c,[0,[0,a[1],a[2]+1|0]]],d[5])}}(i);b(H[12],aa,$);try{var
ab=b4(z,d[2]);b(x[3],[0,i,ab,0],d[4])}catch(a){a=r(a);if(a!==n[8])throw a;b1(i,z,d[2]);var
aE=a}var
ae=1,w=ae}catch(a){a=r(a);if(a!==n[8])throw a;var
w=0,aF=a}var
aG=e}var
aH=e}if(w)continue;var
V=c9(d);if(V)var
aw=V[1],ax=U?[1,aw]:0,y=[0,ax];else
if(a(g[2][2],d[8]))if(0<d[10]){var
m=dk(d),I=[0,0];a(q,function(b){return a(c[3],dl)});try{for(;;){a(aR[4],0);var
h=a(T[4],m),C=h[3];if(C){var
p=C[2],N=C[1],s=N[2],k=N[1],t=d[1];if(0===k[0]){var
v=k[2],D=k[1];if(v){var
ah=v[2],ai=v[1];try{var
aj=b(ac[7],t[6],D),ak=[0,aj,a(f[21][1],v)],am=R(t,s)[6],an=b(H[25],ak,am),ao=function(e,k,l,n,o){return function(g){var
c=bh(d[1],g),h=[0,[0,[0,l,n],c[1]],[0,[0,o,c[2]],k]],i=e[2],j=[0,a(f[23][8],e[1]),i,h];return b(T[3],j,m)}}(h,p,D,ah,ai);b(g[2][14],ao,an)}catch(a){a=r(a);if(a!==n[8])throw a;var
aI=a}}else
try{if(F(t,b(ac[7],t[6],D))===s)b(T[3],[0,h[1],h[2],p],m)}catch(a){a=r(a);if(a!==n[8])throw a;var
aK=a}}else{var
G=k[1];if(!k[2]){var
O=G-1|0;if(0<=o(h[1],O)[1+O]){var
P=G-1|0;if(o(h[1],P)[1+P]===s)b(T[3],[0,h[1],h[2],p],m)}else{var
S=G-1|0;o(h[1],S)[1+S]=s;b(T[3],[0,h[1],h[2],p],m)}}}}else{var
ap=a(f[3],I);I[1]=[0,[0,h[2],h[1]],ap]}continue}}catch(g){g=r(g);if(g!==T[1])throw g;var
aq=a(f[3],I),aB=function(s){var
n=s[2],g=s[1];a(aR[4],0);var
o=0<d[10]?1:0;if(o){if(cH(d,g[1],n))return a(q,function(b){return a(c[3],cI)});j(aO[5],d[9],g[1],n);var
u=d[1],t=function(b){try{var
e=J(u,b);return e}catch(b){b=r(b);if(a(Q[12],b)){var
d=a(c[3],cB);return E(Q[2],0,0,0,d)}throw b}},m=b(f[23][15],t,n),v=a(l[2],g[1]),p=b(f[23][15],Y,m);a(f[23][46],p);var
h=a(l[17],[0,v,p]),i=ay(m,g[4]),k=ay(m,g[6]);d[11]=1;d[10]=d[10]-1|0;return g[2]?(a(q,function(B){var
f=a(c[3],cJ),g=az(d[13],d[14],k),j=a(c[3],cK),l=az(d[13],d[14],i),m=a(c[3],cL),n=a(e[9],h),o=aJ(al[7],0,0,0,d[13],d[14],n),p=a(c[3],cM),q=b(c[12],p,o),r=b(c[12],q,m),s=b(c[12],r,l),t=b(c[12],s,j),u=b(c[12],t,g),v=b(c[12],u,f),w=a(c[5],0),x=a(c[16],d[10]),y=a(c[3],cN),z=b(c[12],y,x),A=b(c[12],z,w);return b(c[12],A,v)}),bj(d,h,i,k)):(a(q,function(B){var
f=a(c[3],cO),g=az(d[13],d[14],k),j=a(c[3],cP),l=az(d[13],d[14],i),m=a(c[3],cQ),n=a(e[9],h),o=aJ(al[7],0,0,0,d[13],d[14],n),p=a(c[3],cR),q=b(c[12],p,o),r=b(c[12],q,m),s=b(c[12],r,l),t=b(c[12],s,j),u=b(c[12],t,g),v=b(c[12],u,f),w=a(c[5],0),x=a(c[16],d[10]),y=a(c[3],cS),z=b(c[12],y,x),A=b(c[12],z,w);return b(c[12],A,v)}),Z(d,[0,h],i,k))}return o};b(f[21][11],aB,aq);var
aC=d[11]?(d[11]=0,aA(1,d)):(a(q,function(b){return a(c[3],dn)}),0),y=aC}}else{a(q,function(b){return a(c[3],dp)});var
y=0}else{a(q,function(b){return a(c[3],dq)});di(d);var
y=aA(0,d)}return y}}catch(a){a=r(a);if(a[1]===bf){var
ar=a[5],as=a[4],at=a[3],au=a[2],av=U?[0,[0,au,at,as,ar]]:0;return[0,av]}throw a}}var
C=[0,a$,ch,aw,ci,Y,cj];aq(150,[0,C,cm,q,co,aP,ct,bb,S,bk,Z,aQ,bg,bd,J,ak,ad,bm,aA,u],"Cc_plugin__Ccalgo");function
aB(a){return[0,a,a,[2,a]]}function
an(c,b){var
d=c[3],e=b[3];if(2===d[0]&&2===e[0])return aB(a(C[3],[0,d[1],e[1]]));var
f=a(C[3],[0,c[2],b[2]]);return[0,a(C[3],[0,c[1],b[1]]),f,[4,c,b]]}function
G(j,i){var
b=j,a=i;for(;;){var
c=b[3],d=a[3],f=0;switch(c[0]){case
2:return a;case
4:var
g=c[2],h=c[1];switch(d[0]){case
2:f=1;break;case
3:var
e=d[1][3];if(4===e[0]){var
l=d[2],m=e[1],n=G(g,e[2]),b=an(G(h,m),n),a=l;continue}break;case
4:var
o=d[1],p=G(g,d[2]);return an(G(h,o),p)}break;default:f=1}if(f){if(2===d[0])return b;if(3===c[0]){var
k=c[1],b=k,a=G(c[2],a);continue}}return[0,b[1],a[2],[3,b,a]]}}function
W(b){var
a=b[3];switch(a[0]){case
0:return[0,b[2],b[1],[1,a[1]]];case
1:return[0,b[2],b[1],[0,a[1]]];case
2:return b;case
3:var
c=a[2],d=W(a[1]);return G(W(c),d);case
4:var
e=a[1],f=W(a[2]);return an(W(e),f);default:var
g=a[4],h=a[3],i=a[2],j=[5,W(a[1]),i,h,g];return[0,b[2],b[1],j]}}function
br(f,e,d,h,j,g,i){a(q,function(o){var
i=u(f,e,d,g),j=a(c[4],dE),k=u(f,e,d,h),l=a(c[3],dF),m=b(c[12],l,k),n=b(c[12],m,j);return b(c[12],n,i)});var
k=_(f,e,d,h,g),l=aS(f,e,d,h,j),m=G(k,aS(f,e,d,g,i));return G(W(l),m)}function
aT(f,e,d,D,k){a(q,function(v){var
g=a(c[3],dx);function
h(b){return a(c[16],b[1][2])}function
i(b){return a(c[3],dy)}var
l=j(c[41],i,h,k),m=a(c[3],dz),n=a(c[4],dA),o=u(f,e,d,D),p=a(c[3],dB),q=b(c[12],p,o),r=b(c[12],q,n),s=b(c[12],r,m),t=b(c[12],s,l);return b(c[12],t,g)});if(k){var
p=k[1],h=p[2],t=p[1],v=t[2],w=t[1],N=k[2];a(q,function(m){var
g=u(f,e,d,v),h=a(c[4],dt),i=u(f,e,d,w),j=a(c[3],du),k=b(c[12],j,i),l=b(c[12],k,h);return b(c[12],l,g)});var
K=_(f,e,d,w,h[1]),L=W(_(f,e,d,v,h[2])),g=h[3];if(typeof
g==="number"){var
x=h[2],y=h[1];a(q,function(m){var
g=u(f,e,d,x),h=a(c[4],dC),i=u(f,e,d,y),j=a(c[3],dD),k=b(c[12],j,i),l=b(c[12],k,h);return b(c[12],l,g)});var
E=ad(d,y),O=E[2],P=E[1],F=ad(d,x),Q=F[1],R=_(f,e,d,O,F[2]),l=an(_(f,e,d,P,Q),R)}else
if(0===g[0]){var
i=g[1];if(g[2])var
s=aP(d,i),z=[0,s[2],s[1],[1,i]];else
var
r=aP(d,i),z=[0,r[1],r[2],[0,i]];var
l=z}else
var
m=g[5],A=g[2],n=br(f,e,d,g[1],A,g[3],g[4]),B=ak(d,A[1]),o=B[3],H=[5,n,B[1],o,m],I=b(C[6],n[2],o-m|0),l=[0,b(C[6],n[1],o-m|0),I,H];var
M=G(G(K,l),L);return G(aT(f,e,d,p[1][2],N),M)}return aB(J(d,D))}function
aS(h,g,d,f,e){a(q,function(l){var
e=a(c[4],dv),i=u(h,g,d,f),j=a(c[3],dw),k=b(c[12],j,i);return b(c[12],k,e)});var
i=bd(d,f,e),j=_(h,g,d,f,i);if(0===e[3])return j;var
l=bg(e),k=ad(d,i),m=k[1],n=J(d,k[2]),o=aS(h,g,d,m,l);return G(j,an(o,aB(n)))}function
_(h,g,d,e,f){a(q,function(o){var
i=u(h,g,d,f),j=a(c[4],dr),k=u(h,g,d,e),l=a(c[3],ds),m=b(c[12],l,k),n=b(c[12],m,j);return b(c[12],n,i)});if(e===f)return aB(J(d,e));var
i=bm(d,e,f),j=i[1],k=W(aT(h,g,d,f,i[2]));return G(aT(h,g,d,e,j),k)}function
aU(e,d,c,b){if(bM<=b[1]){var
a=b[2];return br(e,d,c,a[1],a[2],a[3],a[4])}var
f=b[2];return _(e,d,c,f[1],f[2])}aq(151,[0,aU],"Cc_plugin__Ccproof");var
aV=[p,function(b){return a(O[2],dG)}],dI=[p,function(b){return a(O[2],dH)}],bs=[p,function(b){return a(O[2],dJ)}],dL=[p,function(b){return a(O[2],dK)}],bt=[p,function(b){return a(O[2],dM)}],v=[p,function(b){return a(O[2],dN)}],D=[p,function(b){return a(O[2],dO)}],K=[p,function(b){return a(O[2],dP)}];function
$(c,b,a){return E(aW[10],bu[7],c,b,a)}function
aC(c,b,a){return E(aW[10],bu[2],c,b,a)}var
dQ=j(y[51],1,0,[0,aW[22],2]);function
aD(c,b,a){return j(U[2],c,b,a)[2]}function
L(g,c,z){var
h=z;for(;;){var
A=$(g,c,h),d=b(e[3],c,A);switch(d[0]){case
6:var
o=d[3],p=d[2];if(j(e[aM][13],c,1,o)){var
q=a(aX[46],o),D=aD(g,c,q),E=aD(g,c,p),F=L(g,c,q),G=L(g,c,p),H=[0,a(C[2],[0,E,D]),G],I=[0,a(C[3],H),F];return a(C[3],I)}break;case
9:var
J=d[2],K=L(g,c,d[1]),M=function(a){return L(g,c,a)},N=b(f[23][15],M,J),O=function(c,b){return a(C[3],[0,c,b])};return j(f[23][17],O,K,N);case
10:var
r=d[1],P=r[1],Q=b(e[2][2],c,r[2]),R=a(k[19][5],P),S=[0,a(k[19][2],R),Q],T=a(l[20],S);return a(C[1],T);case
11:var
s=d[1],t=s[1],U=t[2],V=t[1],W=b(e[2][2],c,s[2]),X=a(k[25][5],V),Y=[0,[0,a(k[25][2],X),U],W],Z=a(l[23],Y);return a(C[1],Z);case
12:var
u=d[1],v=u[1],w=v[2],x=v[1],_=x[2],aa=x[1],ab=b(e[2][2],c,u[2]),ac=a(k[25][5],aa),i=[0,a(k[25][2],ac),_],ad=a(dS[42],i)[1],y=b(dT[46],g,[0,i,w]),ae=[0,[0,[0,i,w],ab],y,b(f[5],y,ad[7])];return a(C[4],ae);case
16:var
af=d[2],ah=d[1],ai=function(b){var
c=a(k[25][5],b);return a(k[25][2],c)},aj=b(k[70][20],ai,ah),h=ag(am[10],g,c,aj,af,0);continue}var
m=b(aX[57],c,h);if(b(e[aM][16],c,m)){var
B=j(e[5],dR,c,m);return a(C[1],B)}throw n[8]}}function
aE(k,d,c,g){var
l=k?$:aC,m=l(d,c,g),h=b(e[3],c,m);if(9===h[0]){var
f=h[2],n=h[1],i=A(v),q=B===i?v[1]:p===i?a(w[2],v):v;if(j(e[87],c,q,n)&&3===f.length-1){var
r=L(d,c,o(f,2)[3]),s=L(d,c,o(f,1)[2]);return[0,au,[0,o(f,0)[1],s,r]]}return[0,a5,L(d,c,g)]}return[0,a5,L(d,c,g)]}function
ao(d,c,i){var
w=$(d,c,i),h=b(e[3],c,w);switch(h[0]){case
0:var
k=h[1];return[0,[1,k,0],a(g[2][5],k)];case
6:var
l=h[3],m=h[2];if(j(e[aM][13],c,1,l)){var
n=a(aX[46],l),o=ao(d,c,m),y=o[2],z=o[1],p=ao(d,c,n),A=p[2],B=p[1],D=aD(d,c,n),E=aD(d,c,m),F=b(g[2][7],y,A);return[0,[0,a(C[2],[0,E,D]),[0,z,[0,B,0]]],F]}break;case
9:var
q=h[1],G=h[2],H=function(a){return ao(d,c,a)},I=b(f[23][56],H,G),r=a(f[21][bT],I),s=r[2],t=r[1],u=b(e[3],c,q);if(0===u[0]){var
v=u[1],J=a(g[2][5],v),K=j(f[21][17],g[2][7],J,s);return[0,[1,v,a(f[21][9],t)],K]}var
M=L(d,c,q),N=j(f[21][17],g[2][7],g[2][1],s);return[0,[0,M,a(f[21][9],t)],N]}var
x=L(d,c,i);return[0,[0,x,0],g[2][1]]}function
bv(a){if(1===a[0]&&!a[2])return 0;return 1}function
aY(a){return 0===a[0]?b(f[21][24],aY,a[2]):a[2]?1:0}function
aZ(z,k,c,i,y){try{var
C=z?$:aC,D=C(k,c,y),s=b(e[96],c,D)}catch(a){a=r(a);if(a===l[63])throw n[8];throw a}var
d=s[2],E=s[1],t=A(v),F=B===t?v[1]:p===t?a(w[2],v):v;if(j(e[87],c,F,E)&&3===d.length-1){var
u=ao(k,c,o(d,1)[2]),m=u[1],G=u[2],x=ao(k,c,o(d,2)[3]),q=x[1],H=x[2];if(a(g[2][22],G)===i&&!aY(m))if(bv(m))var
f=0;else
var
J=o(d,0)[1],f=[0,j(e[5],dV,c,J)];else
var
f=1;if(a(g[2][22],H)===i&&!aY(q))if(bv(q))var
h=0;else
var
I=o(d,0)[1],h=[0,j(e[5],dU,c,I)];else
var
h=1;if(1===f&&1===h)throw n[8];return[0,i,f,m,h,q]}throw n[8]}function
dW(h,s,c,r,q){var
d=s,g=r,i=q;for(;;){var
t=h?$:aC,u=t(d,c,i),f=b(e[3],c,u);switch(f[0]){case
6:var
k=f[3],l=f[2],v=f[1],m=A(D),x=B===m?D[1]:p===m?a(w[2],D):D;if(j(e[87],c,x,k))return[0,a1,aZ(h,d,c,g,l)];var
d=b(e[a2],[0,v,l],d),g=g+1|0,i=k;continue;case
9:var
n=f[2];if(1===n.length-1){var
y=f[1],z=n[1],o=A(K),C=B===o?K[1]:p===o?a(w[2],K):K;if(j(e[87],c,C,y))return[0,a1,aZ(h,d,c,g,z)]}break}return[0,bR,aZ(h,d,c,g,i)]}}function
dX(g,d,c,h){var
v=g?$:aC,x=v(d,c,h),f=b(e[3],c,x);switch(f[0]){case
6:var
o=f[3],q=f[2],y=f[1],s=A(D),z=B===s?D[1]:p===s?a(w[2],D):D;if(j(e[87],c,z,o)){var
i=aE(g,d,c,q);if(au<=i[1]){var
k=i[2];return[0,a4,[0,k[1],k[2],k[3]]]}return[0,a6,i[2]]}try{var
C=dW(g,b(e[a2],[0,y,q],d),c,1,o);return C}catch(a){a=r(a);if(a===n[8])return[0,a5,L(d,c,h)];throw a}case
9:var
t=f[2];if(1===t.length-1){var
E=f[1],F=t[1],u=A(K),G=B===u?K[1]:p===u?a(w[2],K):K;if(j(e[87],c,G,E)){var
l=aE(g,d,c,F);if(au<=l[1]){var
m=l[2];return[0,a4,[0,m[1],m[2],m[3]]]}return[0,a6,l[2]]}}break}return aE(g,d,c,h)}function
aa(c,g,f){function
h(b){return a(f,a(e[23],[0,b,g]))}var
d=A(c),j=B===d?c[1]:p===d?a(w[2],c):c,k=a(m[64],j);return b(i[73][1],k,h)}function
ap(c,v,u){function
d(d){function
h(w){var
c=a(i[68][3],d),x=a(i[68][1],d);function
g(k){var
y=j(am[6],c,k,w);function
z(a){return j(am[6],c,k,a)}var
A=b(f[23][15],z,v),o=E(U[15],c,k,y,A),p=o[2],d=o[1],l=p[2],h=u,g=0;for(;;){if(0===h){var
r=a(f[21][9],g),q=a(e[42],[0,p[1],r]);return[0,E(U[3],c,d,q,x),q]}var
i=b(e[3],d,l);if(6===i[0]){var
s=i[3],m=bH(bx[4],0,0,0,0,0,0,0,0,c,d,i[2]),n=m[2],t=m[1],d=t,l=b(e[aM][5],n,s),h=h-1|0,g=[0,n,g];continue}throw[0,bn,dZ]}}return b(by[1],0,g)}var
g=A(c),k=B===g?c[1]:p===g?a(w[2],c):c,l=a(m[64],k);return b(i[73][1],l,h)}return a(i[68][6],d)}function
aF(d,c){function
e(e){var
f=U[1];function
g(a){return b(f,0,a)}var
h=j(s[1],g,e,c)[1],k=b(y[a2],d,c),l=a(i[66][1],h);return b(i[18],l,k)}return a(i[68][6],e)}function
bz(c,b,a){return aK(bA[8],[0,d2[135]],0,d1,d0,c,b,a)}function
P(h,g){function
c(c){var
d=a(i[68][3],c),j=a(s[2],c),e=E(U[1],0,d,j,h),f=bz(d,e[1],e[2]),k=f[1],l=a(g,f[2]),m=a(i[66][1],k);return b(i[18],m,l)}return a(i[68][6],c)}function
t(b){var
c=a(C[5],b);return a(e[9],c)}function
V(h){function
d(l){var
d=h[3];switch(d[0]){case
0:var
D=a(e[9],d[1]);return a(y[46],D);case
1:var
E=a(e[9],d[1]),v=t(h[1]),F=t(h[2]);return P(v,function(a){return aa(dL,[0,a,F,v,E],y[46])});case
2:var
w=d[1],G=t(w);return P(G,function(a){var
b=y[46];return aa(bs,[0,a,t(w)],b)});case
3:var
x=d[2],p=d[1],H=t(p[1]),z=t(p[2]),J=t(x[2]);return P(z,function(a){var
c=ap(bt,[0,a,H,z,J],2),d=[0,V(x),0],e=[0,V(p),d];return b(m[24],c,e)});case
4:var
q=d[2],r=d[1],n=t(r[1]),g=t(q[1]),o=t(r[2]),A=t(q[2]);return P(n,function(f){return P(g,function(h){function
d(d){var
i=a(k[1][7],d3),p=b(s[8],i,l),t=[0,a(e[10],1),[0,g]],u=a(e[23],t),v=[0,b(I[4],[0,p],0),f,u],w=ap(aV,[0,f,d,a(e[21],v),n,o],1),x=ap(aV,[0,h,d,o,g,A],1),z=a(e[23],[0,o,[0,A]]),B=a(e[23],[0,o,[0,g]]),C=ap(bt,[0,d,a(e[23],[0,n,[0,g]]),B,z],2),D=a(c[3],d4),E=[0,j(m[7],0,0,D),0],F=[0,y[123],E],G=V(q),H=[0,b(m[4],x,G),F],J=[0,a(m[29],H),0],K=V(r),L=[0,b(m[4],w,K),J];return b(m[24],C,L)}return P(a(e[23],[0,n,[0,g]]),d)})});default:var
u=d[1],K=d[4],L=d[3],M=d[2],B=t(u[1]),N=t(u[2]),C=t(h[1]),O=b(f[4],1,L),Q=b(f[5],O,K),R=a(e[10],Q);return P(B,function(c){return P(C,function(q){var
f=M[1][2],d=a(s[2],l),g=a(e[10],1),h=a(s[3],l),j=aK(bw[34],h,d,f,g,c,R,C),n=a(k[1][7],dY),o=[0,b(s[8],n,l)],p=[0,b(I[4],o,0),c,j],r=ap(aV,[0,c,q,a(e[21],p),B,N],1),t=V(u),v=b(m[4],r,t),w=a(i[66][1],d);return b(m[4],w,v)})})}}return a(i[68][6],d)}function
d6(c){function
d(d){var
e=U[1];function
f(a){return b(e,0,a)}var
g=j(s[1],f,d,c)[1],h=a(y[46],c),k=a(i[66][1],g);return b(i[18],k,h)}return a(i[68][6],d)}function
bB(l,h,d,j){function
c(f){var
g=t(h),c=t(d);return P(c,function(d){var
n=a(k[1][7],d7),h=b(s[8],n,f),o=a(k[1][7],d8),p=b(s[8],o,f),q=a(e[10],1),r=[0,b(I[4],[0,p],0),d,q],t=a(e[21],r),u=a(e[11],h),w=[0,aa(dI,[0,d,g,t,a(e[11],l),c,u],d6),0],i=[0,d,g,c],x=[0,V(j),w],y=[0,h],z=aa(v,i,function(a){return aF(y,a)});return b(m[24],z,x)})}return a(i[68][6],c)}function
bC(ae,ad,F){function
d(g){var
w=a(s[2],g);a(O[12],O[14]);a(q,function(b){return a(c[3],d$)});var
p=a(s[3],g),r=a(s[2],g),d=bb(p,r,ae),u=[0,0],C=[0,0];function
R(a){S(d,L(p,r,a));return 0}b(f[21][11],R,ad);var
T=a(i[68][2],g);function
W(h){var
c=a(I[11][1][2],h),e=dX(F,p,r,a(I[11][1][4],h)),g=e[1];if(au<=g){if(a1<=g)return bR<=g?aQ(d,c,1,e[2]):aQ(d,c,0,e[2]);if(a4<=g){var
i=e[2],n=i[3],o=i[2];return Z(d,[0,a(l[2],c)],o,n)}var
j=e[2];return bk(d,c,j[2],j[3])}if(a6<=g){var
k=e[2],q=a(f[3],u),s=function(a){return Z(d,[2,a[1],c],a[2],k)};b(f[21][11],s,q);C[1]=[0,[0,c,k],a(f[3],C)];return 0}var
m=e[2],t=a(f[3],C);function
v(a){return Z(d,[2,c,a[1]],m,a[2])}b(f[21][11],v,t);u[1]=[0,[0,c,m],a(f[3],u)];return 0}b(f[21][11],W,T);var
D=aE(F,p,r,a(s[4],g));if(au<=D[1]){var
K=D[2];Z(d,0,K[2],K[3])}else{var
X=D[2],Y=a(f[3],u),_=function(a){return Z(d,[1,a[1]],a[2],X)};b(f[21][11],_,Y)}a(q,function(b){return a(c[3],ea)});var
M=aA(1,d);a(q,function(b){return a(c[3],eb)});var
h=d[1];if(M){var
x=M[1];a(q,function(b){return a(c[3],ec)});if(typeof
x==="number"){var
N=a(i[68][3],g),af=h[5],ag=function(c){var
g=ak(h,c[1]),i=c[3];function
j(a){return t(J(h,a))}var
k=b(f[21][14],j,i),d=g[1],l=d[1],m=c[2],n=[0,l,a(e[2][1],d[2])],o=[0,a(e[30],n),k];return[0,a(e[42],o),m]},ah=b(f[21][73],ag,af),ai=b(bD[3],0,ed),aj=function(a){var
c=a[2],d=aK(ef[9],0,ee,0,k[1][11][1],N,w,a[1]);function
e(a){return ai}var
g=[4,d,b(f[21][61],c,e)],h=b(bD[3],0,g);return j(al[22],N,w,h)},am=a(c[3],eg),an=a(c[5],0),ao=a(c[3],eh),ap=function(h){var
d=a(c[3],ei),e=a(c[13],0),f=a(c[3],ej),g=b(c[12],f,e);return b(c[12],g,d)},aq=j(c[41],ap,aj,ah),ar=a(c[3],ek),as=b(c[12],ar,aq),at=b(c[12],as,ao),av=b(c[26],8,at),aw=a(c[3],el),ax=a(c[5],0),ay=a(c[3],em),az=b(c[12],ay,ax),aB=b(c[12],az,aw),aC=b(c[12],aB,av),aD=b(c[12],aC,an),aG=b(c[12],aD,am);return b(m[6],0,aG)}else{if(0===x[0]){var
z=x[1],Q=z[2],aH=[0,bM,[0,z[1],Q,z[3],z[4]]],G=aU(a(s[3],g),w,h,aH);ak(h,Q[1]);var
ac=function(c){var
d=t(G[1]),j=t(G[2]),e=a(i[68][3],c),l=a(s[2],c),f=E(U[1],0,e,l,d),g=bz(e,f[1],f[2]),n=g[2],o=g[1],p=a(k[1][7],d_),h=b(s[8],p,c),r=[0,a(bw[12],h),0],q=[0,n,d,j],u=[0,V(G),r],w=[0,h],z=aa(v,q,function(a){return aF(w,a)}),x=b(m[24],z,u),y=a(i[66][1],o);return b(m[4],y,x)};return a(i[68][6],ac)}var
o=x[1],aI=a(i[68][3],g),A=aU(aI,w,h,[0,-608347012,[0,o[1],o[2]]]),H=J(h,o[1]),B=J(h,o[2]),n=o[3];if(typeof
n==="number")return V(A);else
switch(n[0]){case
0:var
aJ=a(e[9],n[1]),$=function(f){var
c=t(H),g=t(B),h=a(k[1][7],d5),d=b(s[8],h,f),i=[0,aJ,[0,a(e[11],d)]],j=a(e[23],i);return P(c,function(e){var
h=[0,a(y[99],j),0],f=[0,e,c,g],i=[0,V(A),h],k=[0,d],l=aa(v,f,function(a){return aF(k,a)});return b(m[24],l,i)})};return a(i[68][6],$);case
1:return bB(n[1],H,B,A);default:var
aL=n[2],aM=n[1],ab=function(d){var
f=t(B),g=a(k[1][7],d9),c=b(s[8],g,d),h=[0,a(e[11],c)],i=[0,a(e[11],aL),h],j=a(e[23],i),l=[0,a(y[99],j),0],n=[0,bB(aM,H,B,A),l],o=aF([0,c],f);return b(m[24],o,n)};return a(i[68][6],ab)}}}var
aN=F?en:eo,aO=a(c[3],aN);return b(m[6],0,aO)}return a(i[68][6],d)}function
bE(a,d,c){var
f=b(e[36],d,c),g=b(e[36],a,a);return b(e[36],g,f)}function
ep(f){var
c=a(i[68][4],f),k=a(i[68][3],f),g=$(k,c,a(i[68][1],f)),d=b(e[3],c,g);switch(d[0]){case
6:var
r=d[3],l=A(D),s=B===l?D[1]:p===l?a(w[2],D):D;if(j(e[87],c,s,r))return y[14];break;case
9:var
n=d[2];if(1===n.length-1){var
h=n[1],t=d[1],o=A(K),u=B===o?K[1]:p===o?a(w[2],K):K;if(j(e[87],c,u,t)){var
v=function(c){function
d(c){function
a(a){return y[13]}return b(i[73][1],y[13],a)}function
f(t){var
u=bE(c,h,g),d=bH(bx[4],0,0,0,0,0,0,0,0,k,t,u),v=d[1],w=[0,d[2]],j=a(e[10],1),l=a(e[10],1),f=a(e[10],1),i=[0,b(I[4],0,0),c,f],m=[0,a(e[21],i),l,j],n=[0,a(e[10],2),m],o=a(e[23],n),p=[0,b(I[4],0,0),h,o],q=a(e[21],p),r=bE(c,h,g),s=[0,b(I[4],0,0),r,q],x=[0,a(e[21],s),w];return[0,v,a(e[23],x)]}var
j=b(by[1],1,f);return b(i[73][1],j,d)},q=A(D),x=B===q?D[1]:p===q?a(w[2],D):D,z=a(m[64],x);return b(i[73][1],z,v)}}break}return m[3]}var
eq=a(i[68][6],ep);function
aG(d,c){var
e=bC(d,c,0),f=[0,b(m[4],dQ,y[13]),0],g=a(m[29],[0,y[13],f]),h=a(m[35],g);return b(m[4],h,e)}function
a0(c,b){var
d=[0,eq,[0,bC(c,b,1),0]],e=[0,a(m[35],y[13]),d];return a(m[25],e)}function
es(k){var
D=a(i[68][1],k),c=a(s[2],k);function
F(d){var
c=d[1],e=d[2];if(c[1]!==et[1]&&c[1]!==eu[1])return b(i[21],[0,e],c);return a(i[16],0)}var
d=b(e[3],c,D),z=0;if(9===d[0]){var
g=d[2];if(3===g.length-1){var
G=d[1],H=g[2],I=g[3],n=A(v),J=B===n?v[1]:p===n?a(w[2],v):v;if(j(e[87],c,J,G)){var
q=b(e[3],c,H),r=b(e[3],c,I),C=0;if(9===q[0]&&9===r[0]){var
u=r[2],h=q[2];if(h.length-1===u.length-1){var
x=function(c){if(0<=c){var
D=x(b(f[5],c,1)),F=o(u,c)[1+c],k=o(h,c)[1+c],H=aa(bs,[0],y[87]),r=[0,a(m[27],H),0],t=[0,a(i[16],0),r],z=y[144],g=function(h){function
c(c){var
l=U[1];function
m(a){return b(l,0,a)}var
d=j(s[1],m,c,k),n=d[2],o=d[1],p=a(s[3],c),f=aK(bA[8],0,0,0,er,p,o,n),q=f[1],g=a(e[23],[0,h,[0,f[2],k,F]]),r=a(s[3],c),t=E(U[1],0,r,q,g)[1],u=a(z,g),v=a(i[66][1],t);return b(i[18],v,u)}return a(i[68][6],c)},d=A(v),l=B===d?v[1]:p===d?a(w[2],v):v,n=a(m[64],l),q=b(i[73][1],n,g),C=b(m[24],q,t);return b(m[19],C,D)}var
G=aG(as,0);return a(m[27],G)},t=x(b(f[5],h.length-1,1));C=1}}if(!C)var
t=a(i[16],0);var
l=t;z=1}}}if(!z)var
l=a(i[16],0);return b(i[23],l,F)}var
bF=a(i[68][6],es);aq(172,[0,aG,a0,bF],"Cc_plugin__Cctac");a(ew[9],ev);var
ex=0;function
ey(c,a,d){return a0(b(aH[24],as,c),a)}var
eA=[0,ez,[1,[0,[5,a(af[16],ae[16])]],0]],eD=[0,[0,[0,eC,[0,eB,[1,[4,[5,a(af[16],ae[20])]],eA]]],ey],ex];function
eE(a,c){return a0(b(aH[24],as,a),0)}var
eH=[0,[0,[0,eG,[0,eF,[1,[4,[5,a(af[16],ae[20])]],0]]],eE],eD];function
eI(c,a,d){return aG(b(aH[24],as,c),a)}var
eK=[0,eJ,[1,[0,[5,a(af[16],ae[16])]],0]],eM=[0,[0,[0,eL,[1,[4,[5,a(af[16],ae[20])]],eK]],eI],eH];function
eN(a,c){return aG(b(aH[24],as,a),0)}var
eP=[0,[0,[0,eO,[1,[4,[5,a(af[16],ae[20])]],0]],eN],eM];ag(bG[11],eR,eQ,0,0,eP);var
eS=0,eU=[0,[0,eT,function(a){return bF}],eS];ag(bG[11],eW,eV,0,0,eU);aq(178,[0],"Cc_plugin__G_congruence");return eY});

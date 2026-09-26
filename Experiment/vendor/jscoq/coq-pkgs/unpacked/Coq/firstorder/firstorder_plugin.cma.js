(function(dC){"use strict";var
dD={},H=148,aA="Firstorder",bo="already done",bn="gintuition",bm=155,bt="with",t=136,az=113,af="firstorder",ag=167,bs="Solver",br="-----",X=144,G="coq-core.plugins.firstorder",bq=248,bp="reversible in 1st order mode",ay=100,o=dC.jsoo_runtime,A=o.caml_check_bound,bk=o.caml_fresh_oo_id,E=o.caml_register_global,g=o.caml_string_of_jsbytes,p=o.caml_wrap_exception;function
a(a,b){return a.length==1?a(b):o.caml_call_gen(a,[b])}function
b(a,b,c){return a.length==2?a(b,c):o.caml_call_gen(a,[b,c])}function
h(a,b,c,d){return a.length==3?a(b,c,d):o.caml_call_gen(a,[b,c,d])}function
q(a,b,c,d,e){return a.length==4?a(b,c,d,e):o.caml_call_gen(a,[b,c,d,e])}function
L(a,b,c,d,e,f){return a.length==5?a(b,c,d,e,f):o.caml_call_gen(a,[b,c,d,e,f])}function
bl(a,b,c,d,e,f,g){return a.length==6?a(b,c,d,e,f,g):o.caml_call_gen(a,[b,c,d,e,f,g])}function
dB(a,b,c,d,e,f,g,h,i){return a.length==8?a(b,c,d,e,f,g,h,i):o.caml_call_gen(a,[b,c,d,e,f,g,h,i])}var
f=o.caml_get_global_data(),a_=[0,g(G),g("auto_with")],N=f.Constr,c=f.Util,u=f.Context,d=f.EConstr,$=f.Hipattern,I=f.Global,Z=f.Inductiveops,P=f.Reductionops,v=f.Termops,x=f.Names,Q=f.Int,s=f.Stdlib,r=f.Stdlib__queue,aq=f.Evd,k=f.Pp,aP=f.Ppconstr,ac=f.Printer,ab=f.Hints,T=f.CErrors,ar=f.Typing,R=f.Option,al=f.Heap,l=f.Tacmach,i=f.Tactics,e=f.Tacticals,j=f.Proofview,U=f.Ltac_plugin__Tacinterp,a8=f.Feedback,a5=f.Stdlib__list,a6=f.CClosure,av=f.Ltac_plugin__Pptactic,J=f.Vernacextend,be=f.Attributes,ba=f.Ltac_plugin__Tactic_option,V=f.Ltac_plugin__Tacarg,w=f.Genarg,K=f.Stdarg,bi=f.CLexer,n=f.Pcoq,aw=f.Ltac_plugin__Tacentries,bL=f.Constrextern,bQ=f.Control,b1=f.Evarutil,b2=f.Retyping,b8=f.Coercionops,b9=f.TransparentState,cG=f.Pputils,cn=f.Ltac_plugin__Tacintern,cf=f.Auto,cb=f.Mltop,cd=f.Goptions,ci=f.Ltac_plugin__Tacenv,cj=f.CAst,cO=f.Geninterp;E(55,[0],"Firstorder_plugin");var
bu=g("Firstorder_plugin.Formula.Is_atom"),bw=[0,0,[0,0,0]],bx=g("_"),by=g("Firstorder_plugin.Unify.UFAIL"),bM=g(" : "),bN=g("| "),bO=g(br),bP=g(br),bJ=g(" : No such Hint database"),bK=g("Firstorder: "),bG=[0,0],bF=[0,0],bD=[0,0],bU=g(bp),bT=g("No link"),bS=g("No axiom link"),bR=g("Not the expected number of hyps."),b7=g("not implemented ... yet"),b5=g("Untypable instance, maybe higher-order non-prenex quantification"),b3=[0,0],b4=g(bo),b6=g(bo),bY=g("can't happen."),bZ=g("x"),b_=[0,0],b$=g(bp),cz=g("Firstorder solver tactic is "),ce=[0,0],ca=g(G),cc=[0,g(aA),[0,g("Depth"),0]],ck=g("Firstorder default solver"),cp=g(bs),cq=g(aA),cr=g("Set"),cv=g("Firstorder_Set_Solver"),cw=[0,g(G)],cA=[0,g("Print"),[0,g(aA),[0,g(bs),0]]],cE=g("Firstorder_Print_Solver"),cF=[0,g(G)],cV=g(","),c3=g("using"),c$=g("firstorder_using"),da=g(G),de=g(bt),dh=g(af),dk=g(bt),dm=g(af),dr=g(af),dt=g(af),du=g(G),dx=g(bn),dz=g(bn),dA=g(G);function
ah(h,g,f,e,d,c){var
a=b(h,f,e);return 0===a?b(g,d,c):a}function
aB(j,i,h,g,f,e,d,c){var
a=q(j,h,g,f,e);return 0===a?b(i,d,c):a}var
M=[bq,bu,bk(0)];function
bv(a){return b(c[4],a,1)}function
aC(i,h){var
d=i,e=h;for(;;){var
f=a(N[31],e);if(6===f[0]){var
g=f[3];if(0<d){var
d=b(c[5],d,1),e=g;continue}var
j=aC(0,g);return b(c[4],1,j)}return 0}}function
Y(e,d){var
f=a(I[42],d[1])[1][7],g=b(Z[4],e,d);function
h(a){return aC(f,a)}return b(c[23][15],h,g)}function
O(j,e,i,f,g){var
k=b(Z[4],j,f);function
l(c){var
j=a(d[9],c),k=a(I[42],f[1])[1][9],l=a(u[10][4],k),m=q(v[56],e,l,j,g),n=h(d[115],e,i,m)[2];return b(d[114],e,n)[1]}return b(c[23][15],l,k)}function
ai(d,c,b,a){return q(P[9],d[2],c,b,a)}function
_(o,g,e,D){var
f=q(P[10],o[2],g,e,D),p=h($[23],g,e,f);if(p){var
r=p[1],E=r[1];return[0,E,b(d[t][1],-1,r[2])]}var
s=h($[21],g,e,f);if(s){var
u=s[1];return[5,u[2],u[3]]}var
v=h($[27],g,e,f);if(v){var
j=v[1],k=j[2],F=j[3],w=b(d[99],e,j[1]),i=w[1],l=b(d[2][2],e,w[2]),x=a(I[42],i),m=x[2],y=m[4].length-1,G=x[1];if(0===y)return[1,[0,i,l],k];var
H=0<F?1:0,J=function(a){return 0===a?1:0},n=b(c[23][22],J,m[10]);if(!a(Z[22],[0,i,G,m])){var
C=0;if(!H||n)C=1;if(C)return 1===y?[2,[0,i,l],k,n]:[3,[0,i,l],k,n]}return[6,[0,f]]}var
z=h($[29],g,e,f);if(z){var
A=z[1],K=A[2],B=b(d[99],e,A[1]),L=B[1];return[4,[0,L,b(d[2][2],e,B[2])],K]}return[6,[0,ai(o,g,e,f)]]}var
B=[0,a(x[1][7],bx)];function
aD(s,m,i,p,g,e){var
n=[0,0],k=[0,0],l=[0,0];function
j(E,f,D){var
g=E,o=D;for(;;){var
e=_(s,m,i,o);switch(e[0]){case
0:var
F=e[2];j(g,1-f,e[1]);var
o=F;continue;case
1:var
v=1-f,G=v?(n[1]=1,0):v;return G;case
4:var
z=e[2],M=e[1],N=a(p,1),P=a(d[12],N),Q=A(O(m,i,1,M,z),0)[1],R=function(e,i,c){var
h=a(u[10][1][4],c);return j([0,P,g],f,b(d[t][1],e,h))},S=a(c[21][1],z),T=b(c[5],2,S);return q(c[21][90],R,T,0,Q);case
5:var
U=e[2],V=a(p,1),g=[0,a(d[12],V),g],o=U;continue;case
6:var
r=[0,h(d[t][3],g,0,e[1][1])],B=1-b(d[69],i,r[1]);if(B){if(f){k[1]=[0,r,a(c[3],k)];return 0}l[1]=[0,r,a(c[3],l)];var
C=0}else
var
C=B;return C;default:var
H=e[2],I=e[1];if(e[3]){var
w=[0,ai(s,m,i,h(d[t][3],g,0,o))];if(f)k[1]=[0,w,a(c[3],k)];else
l[1]=[0,w,a(c[3],l)]}var
x=O(m,i,0,I,H),J=function(e,i,c){var
h=a(u[10][1][4],c);return j(g,f,b(d[t][1],e,h))},K=function(d){var
e=a(c[21][1],d),f=b(c[5],1,e);return q(c[21][90],J,f,0,d)};if(f)var
L=function(a){return a?0:1},y=b(c[23][22],L,x);else
var
y=f;if(y)n[1]=1;return b(c[23][13],K,x)}}}switch(g){case
0:j(0,0,e);break;case
1:j(0,1,e);break;default:var
f=b(d[az],i,e),v=f[2],w=f[1],x=function(c){var
b=a(p,1);return a(d[12],b)};j(b(c[21][14],x,w),0,v);n[1]=0}var
o=a(c[3],l),r=[0,a(c[3],k),o];return[0,a(c[3],n),r]}function
aE(i,h,g,q,w,f,o){function
l(a){return ai(i,h,g,a)}try{var
r=bv(a(o,0)),s=i[1]?aD(i,h,g,o,q,f):bw,t=s[1],x=s[2];if(1===q){var
m=_(i,h,g,f);switch(m[0]){case
0:var
j=0;break;case
1:var
j=3;break;case
2:var
j=1;break;case
3:var
j=2;break;case
4:var
z=A(O(h,g,0,m[1],m[2]),0)[1],B=a(c[21][110],z),j=[0,r,a(u[10][1][4],B),t];break;case
5:var
j=4;break;default:throw[0,M,m[1]]}var
v=[1,j]}else{var
d=_(i,h,g,f);switch(d[0]){case
0:var
n=d[1],C=d[2],D=l(n),b=_(i,h,g,n);switch(b[0]){case
0:var
e=[5,b[1],b[2],C];break;case
1:var
e=[0,b[1],b[2]];break;case
2:var
e=[1,b[1],b[2]];break;case
3:var
e=[2,b[1],b[2]];break;case
4:var
e=[4,b[1],b[2]];break;case
5:var
e=[3,n];break;default:var
e=0}var
k=[4,D,e];break;case
1:var
k=0;break;case
2:var
E=d[1];if(d[3])throw[0,M,[0,l(f)]];var
k=[0,E];break;case
3:var
F=d[1];if(d[3])throw[0,M,[0,l(f)]];var
k=[1,F];break;case
4:var
k=[3,d[1]];break;case
5:var
k=[2,r,d[1],t];break;default:throw[0,M,d[1]]}var
v=[0,k]}var
y=[0,[0,w,l(f),v,x]];return y}catch(a){a=p(a);if(a[1]===M)return[1,a[2]];throw a}}E(66,[0,ah,aB,Y,O,B,aD,aE],"Firstorder_plugin__Formula");var
C=[bq,by,bk(0)];function
aF(a){return b(d[t][1],-1,a)}function
aj(f,e){function
g(b){var
c=b[1];return[0,c,a(d[ag][1],b[2])]}var
h=b(c[21][73],g,f),i=a(d[ag][1],e),j=b(v[44],h,i);return a(d[9],j)}function
aG(F,i,$,_){var
j=a(r[2],0),o=[0,0];function
u(e,d){var
f=a(c[3],o);function
g(a){var
b=a[1];return[0,b,aj([0,[0,e,d],0],a[2])]}o[1]=[0,[0,e,d],b(c[21][73],g,f)];return 0}function
x(e){var
f=b(d[3],i,e);if(2===f[0]){var
g=f[1];try{var
h=a(c[3],o),j=x(b(Q[4][2],g,h));return j}catch(a){a=p(a);if(a===s[8])return e;throw a}}return e}b(r[3],[0,$,_],j);try{for(;;){var
G=a(r[5],j),aa=G[2],k=x(h(P[21],F,i,G[1])),l=x(h(P[21],F,i,aa)),f=b(d[3],i,k),e=b(d[3],i,l),g=0;switch(f[0]){case
2:var
q=f[1];if(2===e[0]){var
B=e[1];if(1-(q===B?1:0))if(q<B)u(B,k);else
u(q,l)}else{var
z=aj(a(c[3],o),l),ae=b(v[36],i,z),Y=0;if(a(Q[2][2],ae)&&!h(v[27],i,q,z)){u(q,z);Y=1}if(!Y)throw[0,C,k,l]}break;case
6:var
af=f[3],ag=f[2];switch(e[0]){case
2:g=1;break;case
5:g=2;break;case
6:var
M=e[3],L=e[2],K=af,J=ag;g=4;break;default:g=3}break;case
7:var
ak=f[3],al=f[2];switch(e[0]){case
2:g=1;break;case
5:g=2;break;case
7:var
M=e[3],L=e[2],K=ak,J=al;g=4;break;default:g=3}break;case
9:var
N=f[2],am=f[1];switch(e[0]){case
2:g=1;break;case
5:g=2;break;case
9:var
O=e[2];b(r[3],[0,am,e[1]],j);var
R=N.length-1;if(R!==O.length-1)throw[0,C,k,l];var
S=b(c[5],R,1),an=0;if(!(S<0)){var
m=an;for(;;){var
ao=A(O,m)[1+m],ap=[0,A(N,m)[1+m],ao];b(r[3],ap,j);var
aq=m+1|0;if(S!==m){var
m=aq;continue}break}}break;default:g=3}break;case
13:var
ar=f[7],as=f[6],at=f[5],au=f[4],av=f[3],aw=f[2],ax=f[1];switch(e[0]){case
2:g=1;break;case
5:g=2;break;case
13:var
ay=e[7],az=e[6],aA=e[5],aB=e[4],aC=e[3],aD=e[2],aE=e[1],T=a(I[2],0),D=h(d[bm],T,i,[0,ax,aw,av,au,at,as,ar]),U=D[5],aG=D[4],aH=D[2],E=h(d[bm],T,i,[0,aE,aD,aC,aB,aA,az,ay]),V=E[5],aI=E[4];b(r[3],[0,aH,E[2]],j);b(r[3],[0,aG,aI],j);var
W=U.length-1;if(W!==V.length-1)throw[0,C,k,l];var
X=b(c[5],W,1),aJ=0;if(!(X<0)){var
n=aJ;for(;;){var
aK=A(V,n)[1+n],aL=[0,A(U,n)[1+n],aK];b(r[3],aL,j);var
aM=n+1|0;if(X!==n){var
n=aM;continue}break}}break;default:g=3}break;default:g=1}var
t=0;switch(g){case
1:if(2===e[0]){var
H=e[1],y=aj(a(c[3],o),k),ad=b(v[36],i,y),Z=0;if(a(Q[2][2],ad)&&!h(v[27],i,H,y)){u(H,y);Z=1}if(!Z)throw[0,C,k,l]}else
if(5===f[0]){var
ac=[0,b(v[57],i,k),l];b(r[3],ac,j)}else
t=1;break;case
2:t=1;break;case
3:t=2;break;case
0:break;default:b(r[3],[0,J,L],j);var
ah=aF(M),ai=[0,aF(K),ah];b(r[3],ai,j);t=3}var
w=0;switch(t){case
1:if(5===e[0]){var
ab=[0,k,b(v[57],i,l)];b(r[3],ab,j)}else
w=1;break;case
2:w=1;break;case
0:break;default:w=2}var
aN=0;switch(w){case
1:if(1-h(d[119],i,k,l))throw[0,C,k,l];break;case
0:break;default:aN=1}continue}}catch(b){b=p(b);if(b===r[1])return a(c[3],o);throw b}}function
bz(a,h,e){function
f(e){if(b(d[69],a,e)&&b(d[89],a,e)===h)return 0;function
i(a,e){var
d=f(e);return 0<=a?0<=d?b(c[4],a,d):a:d}var
g=q(d[133],a,i,-1,e);return 0<=g?b(c[4],g,1):-1}return f(e)}function
bA(e,h){var
f=[0,1],g=[0,0];function
i(h,j){var
k=b(d[3],e,j);if(2===k[0]){var
l=k[1];try{var
q=a(c[3],g),r=b(Q[4][2],l,q),t=b(c[4],h,r),u=a(d[10],t);return u}catch(e){e=p(e);if(e===s[8]){var
m=a(c[3],f);f[1]++;g[1]=[0,[0,l,m],a(c[3],g)];var
o=b(c[4],m,h);return a(d[10],o)}throw e}}function
n(a){return a+1|0}return L(d[126],e,n,i,h,j)}var
j=i(0,h),k=a(c[3],f);return[0,b(c[5],k,1),j]}function
aH(k,a,e,c,j,i){var
f=j[1],l=i[1];try{var
m=aG(k,a,f,l),g=b(Q[4][2],e,m);if(b(d[69],a,g))var
h=[0,[1,c]];else
var
n=bz(a,e,f),h=[0,[0,bA(a,g),n]];return h}catch(a){a=p(a);if(a[1]===C)return 0;if(a===s[8])return[0,[1,c]];throw a}}function
aI(g,f,e){function
h(e){var
f=b(c[4],g,e);return a(d[12],f)}var
i=b(c[21][61],f,h);return b(d[t][4],i,e)}function
aJ(h,g,f,e){var
a=f[1],i=e[2],j=e[1],k=aI(0,a,f[2]),l=aI(a,j,i);try{var
m=aG(h,g,k,l),n=function(c){var
e=c[1]<a?1:0,f=c[2];return e?e:b(d[69],g,f)},o=b(c[21][23],n,m);return o}catch(a){a=p(a);if(a[1]===C)return 0;throw a}}E(71,[0,C,aH,aJ],"Firstorder_plugin__Unify");function
aK(a){if(0===a[0]){var
b=a[1];if(typeof
b==="number")return 999;else
switch(b[0]){case
0:return 90;case
1:return 40;case
2:return-30;case
3:return 60;default:var
c=b[2];if(typeof
c==="number")return 0;else
switch(c[0]){case
0:return ay;case
1:return 80;case
2:return 70;case
3:return-20;case
4:return 50;default:return-10}}}var
d=a[1];if(typeof
d==="number")switch(d){case
0:return ay;case
1:return 40;case
2:return-15;case
3:return-50;default:return ay}return-29}var
bB=[0,function(d,a){var
e=aK(a[3]),f=aK(d[3]);return b(c[5],f,e)}],bC=[0,function(c,a){var
e=a[2],f=c[2],d=b(x[71][3][1],c[1],a[1]);if(0===d){var
g=function(c,a){var
d=o.caml_int_compare(c[1],a[1]),e=a[2],f=c[2];return 0===d?b(N[88],f,e):d};return h(R[5],g,f,e)}return d}],y=a(c[25][1],[0,N[88]]),aa=a(c[24][1],bC);function
ak(g,a,f,c){var
e=h(d[5],bD,g,a);try{var
i=[0,f,b(y[25],e,c)],j=h(y[4],e,i,c);return j}catch(a){a=p(a);if(a===s[8])return h(y[4],e,[0,f,0],c);throw a}}function
bE(j,i,g,a){var
e=h(d[5],bF,j,i);try{var
k=b(y[25],e,a),l=function(a){return 1-b(x[71][1],a,g)},f=b(c[21][66],l,k),m=f?h(y[4],e,f,a):b(y[7],e,a);return m}catch(b){b=p(b);if(b===s[8])return a;throw b}}var
D=a(al[2],bB);function
F(a){var
d=b(c[5],a[8],1);return[0,a[1],a[2],a[3],a[4],a[5],a[6],a[7],d]}function
am(c,a){var
d=a[8],e=b(aa[4],c,a[7]);return[0,a[1],a[2],a[3],a[4],a[5],a[6],e,d]}function
an(m,l,c,e){var
f=b(aa[3],c,e[7]);if(f)var
g=f;else{var
h=c[2],n=c[1];if(h){var
i=h[1],j=i[1],o=i[2],k=function(c){var
e=c[2],p=c[1];if(e){var
f=e[1],g=f[1],q=f[2],h=b(x[71][1],n,p);if(h){var
i=j<g?1:0;if(i){var
r=[0,j,a(d[9],o)];return aJ(m,l,[0,g,a(d[9],q)],r)}var
k=i}else
var
k=h;return k}return 0};return b(aa[18],k,e[7])}var
g=0}return g}function
S(k,j,g,f,e,i,a){var
h=aE(k,j,g,f,e,i,a[6]);if(0===h[0]){var
c=h[1];if(1===f){var
l=a[8],m=a[7],n=a[6],o=c[2],p=a[3],q=a[2];return[0,b(D[2],c,a[1]),q,p,o,0,n,m,l]}var
r=a[8],s=a[7],t=a[6],u=a[5],v=a[4],w=a[3],x=ak(g,c[2],e,a[2]);return[0,b(D[2],c,a[1]),x,w,v,u,t,s,r]}var
d=h[1];if(1===f)return[0,a[1],a[2],a[3],d[1],[0,d],a[6],a[7],a[8]];var
y=a[8],z=a[7],A=a[6],B=a[5],C=a[4],E=[0,d,a[3]],F=ak(g,d[1],e,a[2]);return[0,a[1],F,E,C,B,A,z,y]}function
aL(d,b,a){function
e(a,b){return a[1]===B?b:ak(d,a[2],a[1],b)}var
f=a[8],g=a[7],i=a[6],j=a[5],k=a[4],l=a[3],m=h(c[21][18],e,b,a[2]);return[0,h(c[21][18],D[2],b,a[1]),m,l,k,j,i,g,f]}function
ao(g,f,e){var
i=e[2],j=h(d[5],bG,g,f),k=b(y[25],j,i);return a(c[21][5],k)}function
ap(g,f){var
b=f;for(;;){var
c=a(D[3],b[1]),d=a(D[4],b[1]);if(c[1]===B){var
e=[0,d,b[2],b[3],b[4],b[5],b[6],b[7],b[8]];if(b[4]===c[2])return[0,c,e];var
b=e;continue}var
h=b[8],i=b[7],j=b[6],k=b[5],l=b[4],m=b[3];return[0,c,[0,d,bE(g,c[2],c[1],b[2]),m,l,k,j,i,h]]}}function
aM(f){var
b=[0,-1],g=aa[1];function
e(d){if(d)b[1]++;return a(c[3],b)}var
h=a(d[12],1);return[0,D[1],y[1],0,h,0,e,g,f]}function
bH(d){if(2===d[0]){var
e=d[1],f=function(a){return[3,[0,e,b(c[4],a,1)]]},g=a(I[2],0),h=b(Z[24],g,e);return b(c[21][61],h,f)}return[0,d,0]}var
bI=a(c[21][81],bH);function
aN(g,b,f,e,d){var
i=a(bI,e);function
j(c,a){var
h=a[1],d=bl(aq[177],0,0,0,b,a[2],c),e=q(ar[1],0,b,d[1],d[2]),f=e[1];return[0,S(g,b,f,0,c,e[2],h),f]}return h(c[21][18],j,i,[0,d,f])}function
aO(l,f,i,g,e){function
j(g,m){var
c=g[2],e=g[1],h=a(ab[7][8],m);switch(h[0]){case
1:case
4:case
5:return[0,e,c];default:var
i=a(ab[6],h[1])[2];try{var
n=b(d[105],c,i)}catch(a){a=p(a);if(a===N[63])return[0,e,c];throw a}var
o=n[1],j=q(ar[1],0,f,c,i),k=j[1];return[0,S(l,f,k,2,o,j[2],e),k]}}function
m(f,d){try{var
n=a(ab[18],d),e=n}catch(c){c=p(c);if(c!==s[8])throw c;var
g=b(s[28],d,bJ),i=b(s[28],bK,g),l=a(k[3],i),e=h(T[5],0,0,l)}function
m(e,d,b,a){return h(c[21][17],j,a,b)}return h(ab[17][9],m,e,f)}return h(c[21][17],m,[0,e,i],g)}E(82,[0,D,F,am,an,S,aL,ao,ap,aM,aN,aO,function(c){function
e(i,g,f){var
c=a(I[2],0),e=b(aq[20],0,c),j=a(d[9],i),l=bl(bL[7],0,0,0,c,e,j),m=a(k[14],0),n=h(aP[18],c,e,l),o=a(k[3],bM),p=b(k[39],ac[35],g),q=a(k[3],bN),r=b(k[12],q,p),s=b(k[12],r,o),t=b(k[12],s,n),u=b(k[12],t,m);return b(k[12],u,f)}var
f=a(k[3],bO),g=a(k[7],0),i=h(y[13],e,c,g),j=a(k[14],0),l=a(k[3],bP),m=b(k[12],l,j),n=b(k[12],m,i),o=b(k[12],n,f);return b(k[24],0,o)}],"Firstorder_plugin__Sequent");function
m(o,n,m,i,s){function
d(d){a(bQ[4],0);var
r=a(j[68][2],d),e=a(l[3],d),f=a(l[2],d);function
p(x,w,t){var
j=x,i=w,g=t;for(;;){if(0<j){if(i){var
r=i[2],m=i[1],n=a(u[11][1][2],m),y=a(l[4],d);if(!q(v[29],e,f,n,y)){var
z=h(v[31],e,f,n);if(!b(c[21][24],z,g)){var
A=p(b(c[5],j,1),r,[0,m,g]);return S(o,e,f,0,[0,n],a(u[11][1][4],m),A)}}var
j=b(c[5],j,1),i=r,g=[0,m,g];continue}var
B=a(k[3],bR);return q(T[2],0,0,0,B)}return s}}var
g=p(n,r,0),t=m?S(o,e,f,1,B,a(l[4],d),g):g;return a(i,t)}return a(j[68][6],d)}function
z(b){return 0===b[0]?a(i[76],[0,b[1],0]):e[3]}function
aQ(d,c){function
f(f){try{var
h=function(b){return a(i[43],b)},m=ao(a(l[2],f),d,c),n=a(e[64],m),o=b(j[73][1],n,h);return o}catch(c){c=p(c);if(c===s[8]){var
g=a(k[3],bS);return b(e[6],0,g)}throw c}}return a(j[68][6],f)}function
aR(o,n,l,f,g,c){var
q=m(o,1,0,g,c),r=[0,i[13],0],t=[0,z(f),r];function
u(h){try{var
o=ao(h,n,c),q=a(j[16],o),g=q}catch(c){c=p(c);if(c!==s[8])throw c;var
l=a(k[3],bT),g=b(e[6],0,l)}function
m(c){function
g(c){function
g(b){var
e=[0,a(d[23],[0,b,[0,c]]),0];return a(i[H],e)}var
h=a(e[64],f);return b(j[73][1],h,g)}var
h=a(e[64],c);return b(j[73][1],h,g)}return b(j[73][1],g,m)}var
v=[0,b(j[73][1],j[54],u),t],w=a(e[25],v);return h(e[30],w,q,l)}function
aS(d,c,b,a){var
f=m(d,0,1,b,a);return h(e[30],i[120],f,c)}function
aT(g,f,d,c){var
h=m(g,0,1,d,c),j=[0,a(e[37],h)],k=b(i[109],0,j);return b(e[14],k,f)}function
aU(f,g,d,c){var
j=m(f,1,1,d,c),k=a(e[37],j),l=b(e[4],i[14],k),n=b(e[14],l,g),o=m(f,1,1,d,c);return h(e[30],i[13],o,n)}function
aV(o,n,k,c,g,f){function
d(p){var
d=A(Y(a(l[3],p),n),0)[1],q=m(o,d,0,g,f),r=[0,b(e[34],d,i[13]),0],s=[0,z(c),r],t=i[99],u=a(e[64],c),v=[0,b(j[73][1],u,t),s],w=a(e[25],v);return h(e[30],w,q,k)}return a(j[68][6],d)}function
aW(o,n,k,d,g,f){function
p(p){var
q=Y(a(l[3],p),n);function
r(c){var
h=[0,m(o,c,0,g,f),0],j=[0,b(e[34],c,i[13]),h],k=[0,z(d),j];return a(e[25],k)}var
s=b(c[23][15],r,q),t=i[99],u=a(e[64],d),v=b(j[73][1],u,t);return h(e[31],v,s,k)}return a(j[68][6],p)}function
aX(c){var
d=i[99],f=a(e[64],c);return b(j[73][1],f,d)}function
as(u,f,n,s,k,r,q){var
v=f[2],w=f[1];function
g(o){var
x=a(l[2],o),p=O(a(l[3],o),x,0,f,n),g=p.length-1,y=a(c[23][12],n),B=m(u,g,0,r,q),C=[0,b(e[34],g,i[13]),0],D=[0,z(k),C];function
E(s){function
e(f){var
g=A(p,f)[1+f],e=a(c[21][1],g),h=a(d[2][1],v),i=[0,[0,w,b(c[4],f,1)],h],j=[0,a(d[30],i),y],k=a(d[23],j);function
l(f){var
g=b(c[5],e,f);return a(d[10],g)}var
m=b(c[23][2],e,l),n=[0,b(d[t][1],e,k),m],o=[0,a(d[23],n)],q=[0,b(d[t][1],e,s),o],r=a(d[23],q);return b(d[49],r,g)}var
f=b(c[21][61],g,e);return a(i[H],f)}var
F=a(e[64],k),G=[0,b(j[73][1],F,E),D],I=a(e[25],G);return h(e[30],I,B,s)}return a(j[68][6],g)}function
aY(l,k,h,o,n,c,g,f){var
p=b(d[t][1],1,h),q=[0,b(u[4],0,0),k,p],r=a(d[20],q),w=m(l,2,1,g,f),x=[0,a(e[37],w),0],y=[0,i[14],[0,i[14],x]],s=0,v=0,A=[0,z(c),y];function
B(m){var
c=a(d[10],2),e=b(d[t][1],1,k),f=[0,b(u[4],0,0),e,c],g=[0,m,[0,a(d[21],f)]],j=a(d[23],g),l=[0,b(u[4],0,0),h,j],n=[0,a(d[21],l),0];return a(i[H],n)}var
C=a(e[64],c),D=[0,b(j[73][1],C,B),A],E=[0,a(e[25],D),v];function
F(b){return a(i[43],b)}var
G=a(e[64],c),I=[0,b(j[73][1],G,F),E],J=a(i[X],r),K=[0,b(e[24],J,I),s],L=[0,m(l,1,0,g,f),0],M=[0,z(c),L],N=[0,a(e[25],[0,i[14],M]),K],O=a(i[X],o),P=b(e[24],O,N);return b(e[14],P,n)}function
aZ(c,g,f,d){if(c[1])var
l=a(k[3],bU),j=b(e[6],0,l);else
var
j=g;var
n=m(c,0,1,f,d),o=a(e[37],n),p=b(e[4],i[14],o),q=b(e[14],p,g),r=m(c,0,1,f,d),s=h(e[30],i[13],r,q);return b(e[14],s,j)}function
a0(p,o,n,d,k,g){function
f(q){var
f=A(Y(a(l[3],q),o),0)[1],r=[0,m(p,b(c[5],f,1),0,k,g),0],s=[0,b(e[34],f,i[13]),r],t=[0,z(d),s],u=a(e[25],t),v=i[99],w=a(e[64],d),x=b(j[73][1],w,v);return h(e[30],x,u,n)}return a(j[68][6],f)}function
a1(k,o,n,h,g,f){var
p=m(k,0,1,g,F(f)),q=[0,a(e[37],p),0],r=m(k,1,0,g,F(f)),s=[0,a(e[37],r),0],t=[0,i[13],s],u=[0,z(h),t];function
v(g){function
f(h){var
j=a(l[9],h),f=b(c[21][7],j,0),k=[0,g,[0,a(d[11],f)]],m=a(d[23],k),n=a(i[76],[0,f,0]),o=a(i[H],[0,m,0]);return b(e[4],o,n)}return a(j[68][6],f)}var
w=a(e[64],h),x=[0,b(j[73][1],w,v),u],y=[0,a(e[25],[0,i[13],x]),q],A=a(i[X],o),B=b(e[24],A,y);return b(e[14],B,n)}E(88,[0,m,z,aQ,aR,aS,aT,aU,aV,aW,aX,as,aY,aZ,a0,a1],"Firstorder_plugin__Rules");function
bV(f,e){function
g(e,c){var
f=a(d[ag][1],c),g=a(d[ag][1],e);return b(N[88],g,f)}if(0===f[0]){var
h=f[1],i=h[1],k=f[2],l=h[2];if(0===e[0]){var
j=e[1],m=e[2],n=j[2],o=j[1],p=c[5],q=c[5];return aB(function(a,b,c,d){return ah(q,p,a,b,c,d)},g,o,i,k,m,l,n)}return 0===i?1:-1}var
r=f[1];return 0===e[0]?0===e[1][1]?-1:1:g(r,e[1])}function
bW(c,a){return c===a?0:c===B?1:a===B?-1:b(x[71][3][1],c,a)}var
bX=[0,function(b,a){return ah(bV,bW,a[1],b[1],a[2],b[2])}],ad=a(c[24][1],bX);function
a2(F,E,d,j){var
e=[0,ad[1]];function
f(g){var
h=g[3],l=0;if(0===h[0]){var
d=h[1],G=0;if(typeof
d!=="number"&&2===d[0]){var
t=d[3],i=d[2],s=d[1];l=1;G=1}}else{var
f=h[1];if(typeof
f!=="number"){var
t=f[3],i=f[2],s=f[1];l=1}}if(l){var
u=g[4],n=[0,1],o=[0,t],B=g[1],p=function(f,d){function
g(h,g){var
d=aH(F,E,s,i,h,g);if(d){var
f=d[1];if(0===f[0]){n[1]=0;var
j=a(c[3],e);e[1]=b(ad[4],[0,f,B],j);return 0}o[1]=1;return 0}return 0}var
h=f[1];function
j(a){var
e=d[2];function
f(b){return g(a,b)}return b(c[21][11],f,e)}b(c[21][11],j,h);var
k=f[2];function
l(a){var
e=d[1];function
f(b){return g(a,b)}return b(c[21][11],f,e)}return b(c[21][11],l,k)},y=j[1],z=function(a){return p(u,a[4])};b(D[5],z,y);var
m=j[5],x=m?[0,m[1],0]:0;p(u,[0,x,j[3]]);var
r=a(c[3],n),v=r?a(c[3],o):r;if(v){var
C=a(c[3],e);e[1]=b(ad[4],[0,[1,i],g[1]],C);var
w=0}else
var
w=v;return w}var
A=a(k[3],bY);return q(T[2],0,0,0,A)}b(c[21][11],f,d);var
g=a(c[3],e);return a(ad[23],g)}function
ae(d,b){try{var
e=ap(d,b),f=e[1],a=f[3],c=0,j=e[2];if(0===a[0]){var
k=0,g=a[1];if(typeof
g!=="number"&&2===g[0]){c=1;k=1}}else
if(typeof
a[1]!=="number")c=1;if(c)var
i=ae(d,j),h=[0,[0,f,i[1]],i[2]];else
var
h=[0,0,b];return h}catch(a){a=p(a);if(a===al[1])return[0,0,b];throw a}}var
a3=a(x[1][7],bZ);function
b0(j,e,y,w,g,v){if(y===B)var
o=a3;else
var
H=L(b2[2],0,0,j,e,w),I=h(P[22],j,e,H),s=b(d[93],e,I)[1][1],J=s?s[1]:a3,o=J;function
z(e){var
f=b(c[5],g,e);return a(d[10],f)}var
A=b(c[21][61],g,z),C=b(d[t][4],A,v),n=g,m=x[1][11][1],f=j,l=e,k=0;for(;;){if(0===n)return[0,l,k,C];var
p=h(i[11],m,o,f),q=dB(b1[6],0,0,0,0,0,f,l,aq[135]),D=q[2][1],E=q[1],r=[0,b(u[4],[0,p],0),D],F=b(d[137],r,f),G=b(x[1][11][4],p,m),n=b(c[5],n,1),m=G,f=F,l=E,k=[0,r,k];continue}}function
at(g,r,n,s,o){function
f(f){var
t=a(j[68][3],f),u=a2(t,a(l[2],f),r,o);function
v(n){if(n[2]===B)var
f=n[1],r=function(n,o){function
h(C){if(0===f[0]){var
h=f[1];if(0===h[1]){var
p=h[2],q=[0,m(g,0,1,n,F(o)),0],r=a(e[38],q),s=a(i[az],[0,[0,p,0]]);return b(e[4],s,r)}var
t=a(k[3],b7);return b(e[6],0,t)}var
u=f[1],v=[0,a(e[27],i[42]),0],w=[0,m(g,0,1,n,F(o)),0],x=[0,a(e[38],w),0];function
y(e){var
f=a(l[9],e),g=b(c[21][7],f,0),h=[0,[0,a(d[11],g),0]];return a(i[az],h)}var
z=[0,a(j[68][6],y),x],A=[0,a(e[25],[0,i[14],z]),v],B=a(i[X],u);return b(e[24],B,A)}return a(j[68][6],h)};else
var
r=function(z,o){var
f=n[2],r=n[1];function
s(u){var
n=a(l[2],u),v=a(j[68][3],u);if(0===r[0]){var
w=r[1],s=w[2],t=w[1],x=[0,t,h(d[5],b3,n,s)];if(an(v,n,[0,f,[0,x]],o)){var
A=a(k[3],b4);return b(e[6],0,A)}if(0<t)var
B=function(g){function
c(c){var
o=a(l[2],c),e=b0(a(l[3],c),o,f,g,t,s),r=e[2],u=e[1],v=a(d[23],[0,g,[0,e[3]]]),m=b(d[49],v,r);try{var
A=a(l[3],c),B=q(ar[1],0,A,u,m),n=B}catch(b){b=p(b);if(!a(T[12],b))throw b;var
w=a(k[3],b5),n=h(T[5],0,0,w)}var
x=n[1],y=a(i[H],[0,m,0]),z=a(j[66][1],x);return b(j[18],z,y)}return a(j[68][6],c)},C=a(e[64],f),y=b(j[73][1],C,B);else
var
G=function(b){var
c=[0,a(d[23],[0,b,[0,s]]),0];return a(i[H],c)},I=a(e[64],f),y=b(j[73][1],I,G);var
D=[0,m(g,1,0,z,F(am([0,f,[0,x]],o))),0],E=[0,a(e[38],D),0];return a(e[25],[0,y,[0,i[14],E]])}var
J=r[1];if(an(v,n,[0,f,0],o)){var
K=a(k[3],b6);return b(e[6],0,K)}var
L=[0,a(e[27],i[42]),0],M=[0,m(g,1,0,z,F(am([0,f,0],o))),0],N=[0,a(e[38],M),0],O=[0,i[14],N];function
P(e){function
f(f){var
g=a(l[9],f),h=b(c[21][7],g,0),j=[0,e,[0,a(d[11],h)]],k=[0,a(d[23],j),0];return a(i[H],k)}return a(j[68][6],f)}var
Q=a(e[64],f),R=[0,b(j[73][1],Q,P),O],S=[0,a(e[25],[0,i[14],R]),L],U=a(i[X],J);return b(e[24],U,S)}return a(j[68][6],s)};return r(s,o)}var
w=b(c[21][73],v,u),x=a(e[29],w);return b(e[14],x,n)}return a(j[68][6],f)}E(91,[0,ae,a2,at],"Firstorder_plugin__Instances");function
a4(c){function
d(a,d){var
c=d[1];if(1===c[0]){var
e=b(x[20][8],c[1],a[2]);return[0,a[1],e]}return a}var
e=a(b8[25],0),f=h(a5[25],d,b9[2],e);return[0,c,b(a6[1][12],a6[2],f)]}function
a7(c,R,d){function
f(f){function
t(w,m){function
d(u){if(o.caml_equal(a(U[8],0),b_)){var
S=a(ac[73][1],u);b(a8[9],0,S)}try{var
z=ap(a(l[2],u),m),h=z[2],i=z[1],f=function(b){return aL(a(l[2],u),w,b)},V=0,g=function(a){return t(V,a)},d=t([0,i,w],h),x=i[3];if(0===x[0]){var
n=x[1];if(typeof
n==="number")var
q=aX(i[1]);else
switch(n[0]){case
0:var
W=n[1],X=f(h),q=aV(c,W,d,i[1],g,X);break;case
1:var
Y=n[1],Z=f(h),q=aW(c,Y,d,i[1],g,Z);break;case
2:var
B=ae(a(l[2],u),m),C=B[1],_=B[2],D=t(b(s[37],C,w),_),O=0;if(c[1]&&0<m[8]){var
E=at(c,C,D,g,f(m));O=1}if(!O)var
E=D;var
q=E;break;case
3:var
$=n[1];if(c[1])var
aa=f(h),F=a0(c,$,d,i[1],g,aa);else
var
F=d;var
q=F;break;default:var
j=n[2],ab=n[1];if(typeof
j==="number")var
v=d;else
switch(j[0]){case
3:var
P=0,ai=j[1];if(0<m[8]&&c[1]){var
aj=f(h),G=a1(c,ai,d,i[1],g,aj);P=1}if(!P)var
G=d;var
v=G;break;case
4:var
ak=j[2],am=j[1];if(c[1])var
an=f(h),H=as(c,am,ak,d,i[1],g,an);else
var
H=d;var
v=H;break;case
5:var
ao=j[3],aq=j[2],ar=j[1],au=f(h),v=aY(c,ar,aq,ao,d,i[1],g,au);break;default:var
af=j[2],ag=j[1],ah=f(h),v=as(c,ag,af,d,i[1],g,ah)}var
ad=f(h),q=aR(c,ab,v,i[1],g,ad)}var
A=q}else{var
I=x[1];if(typeof
I==="number")switch(I){case
0:var
r=aU(c,d,g,f(h));break;case
1:var
r=aS(c,d,g,f(h));break;case
2:var
r=aT(c,d,g,f(h));break;case
3:var
r=d;break;default:if(c[1])var
av=a(k[3],b$),J=b(e[6],0,av);else
var
J=d;var
r=aZ(c,J,g,f(h))}else{var
K=ae(a(l[2],u),m),L=K[1],aw=K[2],M=t(b(s[37],L,w),aw),Q=0;if(c[1]&&0<m[8]){var
N=at(c,L,M,g,f(m));Q=1}if(!Q)var
N=M;var
r=N}var
A=r}var
y=A}catch(a){a=p(a);if(a!==al[1])throw a;var
y=R}var
T=aQ(m[4],m);return b(e[14],T,y)}return a(j[68][6],d)}var
g=a(j[68][2],f),h=a(a5[1],g);return a(d,function(a){var
b=0;return m(c,h,1,function(a){return t(b,a)},a)})}return a(j[68][6],f)}E(98,[0,a4,a7],"Firstorder_plugin__Ground");a(cb[9],ca);var
a9=h(cd[9],0,cc,3),cg=[0,a_,0],ch=[0,function(b,a){return q(cf[11],0,0,0,ce)}];h(ci[16],0,a_,ch);var
a$=b(cj[1],0,[29,cg,0]),au=b(ba[2],[0,a$],ck),bb=au[3],bc=au[2],bd=au[1],cl=0,cm=0;function
co(e,i,d,g){var
f=b(be[2],ba[1],d);function
c(b){return h(bd,0,f,a(cn[2],e))}return a(J[5],c)}var
cs=[0,[0,0,[0,cr,[0,cq,[0,cp,[1,[5,a(w[16],V[9])],0]]]],co,cm],cl],ct=0,cu=[0,function(a){return J[21]}];L(J[17],cw,cv,cu,ct,cs);var
cx=0,cy=0,cB=[0,[0,0,cA,function(f,d,e){a(be[3],d);function
c(f){var
c=a(bb,0),d=a(k[3],cz),e=b(k[12],d,c);return b(a8[7],0,e)}return a(J[5],c)},cy],cx],cC=0,cD=[0,function(a){return J[20]}];L(J[17],cF,cE,cD,cC,cB);function
W(f,d,i,h){var
c=a4(f);function
g(a){return b(j[21],[0,a[2]],a[1])}function
k(g){var
f=d?d[1]:a(bc,0);return a7(c,f,function(k){function
d(d){var
m=aM(a(a9,0)),n=a(l[2],d),f=aN(c,a(l[3],d),n,i,m),o=f[2],p=f[1],g=aO(c,a(l[3],d),o,h,p),q=g[2],r=a(k,g[1]),s=a(j[66][1],q);return b(e[4],s,r)}return a(j[68][6],d)})}var
m=a(j[68][6],k);return b(j[22],m,g)}function
bf(d,c,b){return a(av[27],aP[7])}function
bg(f,e,d){function
b(b){return a(ac[35],b[2])}var
c=a(cG[5],b);return a(av[27],c)}function
bh(d,c,b){return a(av[27],ac[35])}function
cH(b,a){return bh}function
cI(b,a){return bg}var
cJ=[0,function(b,a){return bf},cI,cH],cK=[1,[1,K[23]]],cL=[1,[1,K[23]]],cM=[1,[1,K[23]]],cN=a(w[6],K[23]),cP=[0,[1,a(cO[3],cN)]],cQ=0;function
cR(a,c,b){return a}var
cS=0,cT=0;function
cU(b,a){return 0}var
cW=a(bi[9],cV),cX=a(n[3][10],cW),cY=b(n[4][3],n[4][1],cX),cZ=[0,b(n[5][1],cY,cU),cT],c0=a(n[3][12],cZ),c1=a(n[3][1],n[15][15]),c2=h(n[3][6],c1,c0,cS),c4=a(bi[9],c3),c5=a(n[3][10],c4),c6=b(n[4][2],n[4][1],c5),c7=b(n[4][2],c6,c2),c8=[0,b(n[6][1],c7,cR),cQ];function
c9(a){return 0}var
c_=[0,[1,[0,b(n[6][1],n[4][1],c9),c8]],cP,cM,cL,cK,cJ],bj=h(aw[14],da,c$,c_),ax=bj[1],db=bj[2],dc=0;function
dd(f,e,d,c){var
g=a(U[25],c);return W(1,b(R[17],g,f),e,d)}var
df=[0,de,[1,[0,[5,a(w[16],K[22])]],0]],dg=[1,[5,a(w[16],ax)],df],di=[0,[0,[0,dh,[1,[4,[5,a(w[16],V[9])]],dg]],dd],dc];function
dj(e,d,c){var
f=a(U[25],c);return W(1,b(R[17],f,e),0,d)}var
dl=[0,dk,[1,[0,[5,a(w[16],K[22])]],0]],dn=[0,[0,[0,dm,[1,[4,[5,a(w[16],V[9])]],dl]],dj],di];function
dp(e,d,c){var
f=a(U[25],c);return W(1,b(R[17],f,e),d,0)}var
dq=[1,[5,a(w[16],ax)],0],ds=[0,[0,[0,dr,[1,[4,[5,a(w[16],V[9])]],dq]],dp],dn];L(aw[11],du,dt,0,0,ds);var
dv=0;function
dw(d,c){var
e=a(U[25],c);return W(0,b(R[17],e,d),0,0)}var
dy=[0,[0,[0,dx,[1,[4,[5,a(w[16],V[9])]],0]],dw],dv];L(aw[11],dA,dz,0,0,dy);E(117,[0,a9,a$,bd,bc,bb,W,bf,bg,bh,ax,db],"Firstorder_plugin__G_ground");return dD});

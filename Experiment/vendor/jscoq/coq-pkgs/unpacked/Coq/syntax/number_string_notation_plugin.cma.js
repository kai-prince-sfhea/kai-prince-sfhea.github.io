(function(gi){"use strict";var
gj={},L=".",a5="num.float.type",af="numbers",a8=" or (option ",a3="Notation",a4="core.option.type",a_=",",a9="warning",F="(",a7="Instead of Number.int, the types Number.uint or Z or PrimInt63.pos_neg_int63 or PrimFloat.float or Number.number could be used (you may need to require BinNums or Number or PrimInt63 or PrimFloat first).",ae="[",Q="after",E=")",a2=").",R="=>",S="]",a1=":",y="coq-core.plugins.number_string_notation",a6=" was already mapped to",a0="abstract",ag=167,aZ=" should go from ",aY="num.int63.type",r=gi.jsoo_runtime,aX=r.caml_check_bound,O=r.caml_register_global,d=r.caml_string_of_jsbytes,D=r.caml_wrap_exception;function
a(a,b){return a.length==1?a(b):r.caml_call_gen(a,[b])}function
b(a,b,c){return a.length==2?a(b,c):r.caml_call_gen(a,[b,c])}function
g(a,b,c,d){return a.length==3?a(b,c,d):r.caml_call_gen(a,[b,c,d])}function
P(a,b,c,d,e){return a.length==4?a(b,c,d,e):r.caml_call_gen(a,[b,c,d,e])}function
K(a,b,c,d,e,f){return a.length==5?a(b,c,d,e,f):r.caml_call_gen(a,[b,c,d,e,f])}function
ad(a,b,c,d,e,f,g){return a.length==6?a(b,c,d,e,f,g):r.caml_call_gen(a,[b,c,d,e,f,g])}var
f=r.caml_get_global_data(),Y=d(aY),Z=d(a5),aw=d(a5),au=d("num.int63.pos_neg_int63"),ak=d("num.int.type"),al=d("num.uint.type"),am=d("num.decimal.type"),an=d("num.hexadecimal_int.type"),ao=d("num.hexadecimal_uint.type"),ap=d("num.hexadecimal.type"),aq=d("num.num_int.type"),ar=d("num.num_uint.type"),as=d("num.number.type"),ai=d("num.Z.type"),aj=d("num.pos.type"),l=f.Constrexpr_ops,aG=f.CAst,I=f.Global,J=f.Evd,q=f.Smartlocate,v=f.Nametab,aN=f.Notation,u=f.Stdlib,j=f.Coqlib,G=f.Names,n=f.Libnames,at=f.Pretyping,C=f.EConstr,az=f.Abbreviation,h=f.Util,X=f.Int,m=f.Constr,aC=f.Impargs,aB=f.Reductionops,c=f.Pp,w=f.CErrors,B=f.Printer,ax=f.Constrintern,av=f.Pretype_errors,U=f.CWarnings,t=f.Vernacextend,N=f.Attributes,aW=f.Locality,H=f.NumTok,e=f.Pcoq,i=f.CLexer,A=f.Stdarg,x=f.Genarg,bX=f.Notation_ops,bV=f.Assert_failure,bS=f.Retyping,bR=f.Glob_ops,bt=f.Constrextern,bu=f.Ppconstr,be=f.Termops,a$=f.CSet,ba=f.CMap,fR=f.Option,cp=f.Mltop;O(146,[0],"Number_string_notation_plugin");var
T=a(a$[1],[0,m[88]]),o=a(ba[1],[0,m[88]]),cq=[0,0,0],ct=[0,0],cG=[0,0,1],cH=[0,0,0],cz=[0,0,1],cA=[0,0,0],bY=d("num.int63.wrap_int"),bZ=d("Coq.Numbers.Cyclic.Int63.PrimInt63.int_wrapper"),b0=d("num.float.wrap_float"),b1=d("Coq.Floats.PrimFloat.float_wrapper"),bU=[0,d("_vendor+v8.17+32bit/coq/plugins/syntax/number.ml"),240,13],ck=d("'via' and 'abstract' cannot be used together."),cj=d("Multiple 'warning after' or 'abstract after' options."),ci=d("Multiple 'via' options."),bD=d("This might yield ill typed terms when using the notation."),bE=d(L),bF=d("instead of "),bG=d("Expected type is: "),bH=d(L),bI=d(" seems incompatible with the type of"),bJ=d("Type of"),bw=d(" might yield ill typed terms when using the notation."),bx=d(", mapping it also to"),by=d(a6),br=d(L),bs=d("Missing mapping for constructor "),bm=d(L),bn=d(" and cannot be remapped to"),bo=d(a6),bj=d(L),bk=d("Wrong number of parameters for inductive"),b6=d(a7),b9=d(" to Number.int or (option Number.int)."),ca=d(aZ),bN=d(a7),bQ=d(a2),bT=d(a8),bW=d(" should go from Number.int to "),bK=d(aY),bq=d(a4),bc=d("option type."),bd=d(") targets an "),bf=d("the parsing function ("),bg=d("The 'abstract after' directive has no effect when "),bh=d(af),bi=d("abstract-large-number-no-op"),bz=d(af),bA=d("via-type-remapping"),bL=d(af),bM=d("via-type-mismatch"),cb=[0,0],cc=[0,0,1],ch=[0,0,0],cl=[0,1,1],cn=[0,1,0],cd=[0,0,1],ce=[0,0,0],cf=[0,1,1],cg=[0,1,0],b_=d(" to Byte.byte or (option Byte.byte) or (list Byte.byte) or (option (list Byte.byte))."),b$=d(aZ),b5=d(a2),b7=d(a8),b8=d(" should go from Byte.byte or (list Byte.byte) to "),b4=d("core.byte.type"),b3=d("core.list.type"),b2=d(a4),cJ=d(E),cK=d(F),cF=d(E),cI=d(F),cC=d(S),cD=d(" mapping ["),cE=d("via "),cw=d(R),cx=d(S),cy=d(ae),cB=d(R),cu=d(E),cv=d(F),cr=d("warning after "),cs=d("abstract after "),co=d(y),cP=d(E),cT=d(Q),cW=d(a9),cZ=d(F),c9=d(E),db=d(Q),de=d(a0),dh=d(F),ds=d("deprecated_number_modifier"),dt=d(y),dz=d(R),dJ=d(R),dM=d(S),dQ=d(ae),d0=d("number_string_mapping"),d1=d(y),d5=d(S),d$=d(a_),eh=d(ae),ek=d("mapping"),eo=d("via"),ez=d("number_string_via"),eA=d(y),eF=d(Q),eI=d(a9),eR=d(Q),eU=d(a0),e6=d("number_modifier"),e7=d(y),e$=d(E),ff=d(a_),fn=d(F),fv=d("number_options"),fw=d(y),fA=d(E),fE=d(F),fM=d("string_option"),fN=d(y),fT=d(a1),fY=d(a3),fZ=d("Number"),f3=d("NumberNotation"),f4=[0,d(y)],f8=d(a1),gb=d(a3),gc=d("String"),gg=d("StringNotation"),gh=[0,d(y)];function
bb(d){var
e=a(c[22],bc),f=a(c[22],bd),g=a(I[2],0),h=a(be[75],g),i=b(v[48],h,d),j=a(c[22],bf),k=a(c[22],bg),l=b(c[12],k,j),m=b(c[12],l,i),n=b(c[12],m,f);return b(c[12],n,e)}var
bp=P(U[1],bi,bh,0,bb);function
ah(c){var
d=a(I[42],c)[2][4];function
e(a,d){return[3,[0,c,b(h[4],a,1)]]}var
f=b(h[23][16],e,d);return a(h[23][11],f)}function
p(b){var
c=a(j[2],b);return g(v[49],0,G[1][11][1],c)}function
s(c){var
b=a(v[13],c);if(2===b[0])return b[1];throw u[8]}function
k(f,e,d,c){var
g=[0,a(l[13],d),2,c],h=a(l[14],g),b=at[8],i=[0,0,b[2],b[3],b[4],b[5],b[6],b[7]];try{ad(ax[12],[0,i],0,f,e,0,h);var
j=1;return j}catch(a){a=D(a);if(a[1]===av[1])return 0;throw a}}function
bl(h,f,e,d){var
i=a(c[3],bm),j=a(B[35],d),k=a(c[13],0),l=a(c[3],bn),m=a(B[35],e),n=a(c[13],0),o=a(c[3],bo),p=a(B[35],f),q=b(c[12],p,o),r=b(c[12],q,n),s=b(c[12],r,m),t=b(c[12],s,l),u=b(c[12],t,k),v=b(c[12],u,j),x=b(c[12],v,i);return g(w[5],h,0,x)}function
ay(c,b,d){var
e=a(C[9],d),f=ad(bt[7],0,0,0,c,b,e);return g(bu[18],c,b,f)}function
bv(d){var
f=d[5],g=d[4],h=d[3],i=d[2],j=d[1];function
e(a){return ay(j,i,a)}var
k=a(c[3],bw),l=e(f),m=a(c[13],0),n=a(c[3],bx),o=e(g),p=a(c[13],0),q=a(c[3],by),r=e(h),s=b(c[12],r,q),t=b(c[12],s,p),u=b(c[12],t,o),v=b(c[12],u,n),w=b(c[12],v,m),x=b(c[12],w,l);return b(c[12],x,k)}var
bB=P(U[1],bA,bz,0,bv);function
bC(d){var
f=d[6],g=d[5],h=d[4],i=d[3],j=d[2],k=d[1];function
e(a){return ay(k,j,a)}var
l=a(c[3],bD),m=a(c[13],0),n=a(c[3],bE),o=e(f),p=a(c[3],bF),q=a(c[13],0),r=e(g),s=a(c[3],bG),t=a(c[13],0),u=a(c[3],bH),v=a(B[35],h),w=a(c[13],0),x=a(c[3],bI),y=a(B[35],i),z=a(c[13],0),A=a(c[3],bJ),C=b(c[12],A,z),D=b(c[12],C,y),E=b(c[12],D,x),F=b(c[12],E,w),G=b(c[12],F,v),H=b(c[12],G,u),I=b(c[12],H,t),J=b(c[12],I,s),K=b(c[12],J,r),L=b(c[12],K,q),M=b(c[12],L,p),N=b(c[12],M,o),O=b(c[12],N,n),P=b(c[12],O,m);return b(c[12],P,l)}var
bO=P(U[1],bM,bL,0,bC);function
bP(e,d){function
c(h){var
c=a(v[14],h);if(0===c[0])throw u[8];var
d=b(az[2],0,c[1]);if(!d[1]){var
f=d[2];if(14===f[0]){var
i=a(bR[7],f[1]),g=P(J[172],0,0,e,i),j=g[1];return[0,j,a(m[8],g[2])]}}throw u[8]}try{var
h=c(d);return h}catch(c){c=D(c);if(c===u[8]){var
f=b(q[3],0,d);if(2===f[0])return[0,e,a(m[22],f[1])];var
g=a(q[4],d);return[0,e,a(m[19],g)]}throw c}}function
aA(i,c,n){var
q=a(C[9],n),d=i,f=0,j=K(bS[2],0,0,i,c,q);for(;;){var
k=g(aB[22],d,c,j),e=b(C[3],c,k);if(6===e[0]){var
l=e[1],p=e[3],m=g(aB[22],d,c,e[2]),d=b(C[137],[0,l,m],d),f=[0,[0,l,m],f],j=p;continue}var
o=a(h[21][9],f),r=a(C[ag][1],k),s=function(b){var
c=b[1];return[0,c,a(C[ag][1],b[2])]};return[0,b(h[21][73],s,o),r]}}function
V(j,z,i,f){function
k(d){if(3===d[0]){var
k=K(J[175],0,0,j,z,d[1]),A=k[1],l=aA(j,A,a(m[25],k[2])),C=l[1],n=a(m[31],l[2]),o=9===n[0]?a(h[23][11],n[2]):0,e=a(h[21][1],C),p=r.caml_make_vect(e,0),D=a(h[21][1],o);if(a(h[21][1],f)!==D){var
q=a(c[3],bj),s=a(B[35],[2,i]),t=a(c[13],0),u=a(c[3],bk),v=b(c[12],u,t),x=b(c[12],v,s),y=b(c[12],x,q);g(w[5],0,0,y)}var
E=function(c,i){var
d=a(m[31],i);if(c&&0===d[0]){var
f=d[1],j=c[1];if(f<=e){var
g=b(h[5],e,f);aX(p,g)[1+g]=[1,j];return 0}}return 0};g(h[21][19],E,f,o);return[0,d,d,a(h[23][11],p)]}throw[0,bV,bU]}var
d=ah(i),e=b(h[21][73],k,d);function
l(a){var
c=a[3],d=0;function
e(a){return r.caml_equal(d,a)}return b(h[21][23],e,c)}var
n=b(h[21][23],l,e)?[0]:[0,e];return[0,n,d]}function
W(i,C,A,z,y){var
p=bP(C,A),r=p[2],j=p[1],d=a(m[22],z);function
E(d){var
g=d[3],e=d[2],p=d[1],r=g[2],s=e[2],c=b(q[3],0,e);switch(c[0]){case
2:var
f=[0,c,a(m[22],c[1])];break;case
3:var
f=[0,c,a(m[24],c[1])];break;default:var
o=a(q[4],e),f=[0,c,a(m[19],o)]}var
t=f[2],k=a(q[6],g),u=a(m[24],k),v=[3,k];function
l(e){function
c(b){var
c=a(m[31],b);if(9===c[0]){var
d=c[1];if(a(m[41],d))return d}return b}var
d=aA(i,j,e),f=d[1],g=c(d[2]);function
k(a){var
b=a[1];return[0,b,c(a[2])]}return[0,b(h[21][73],k,f),g]}var
w=l(u),x=l(t);if(p)var
y=a(aC[33],c),n=a(aC[39],y);else
var
n=0;return[0,s,c,x,r,v,w,n]}var
e=b(h[21][73],E,y);function
s(c,a){return b(G[71][1],c,a[5])}var
F=a(T[5],d);function
H(c,a){return b(T[4],a[6][2],c)}var
I=g(h[21][17],H,F,e),J=o[1];function
K(b,c){var
d=ah(a(m[77],b)[1]);return g(o[4],b,d,c)}var
k=g(T[16],K,I,J),L=0;function
M(c,a){var
b=a[5],d=a[2],e=a[4];try{var
f=bl(e,b,g(h[21][120],G[71][1],b,c),d);return f}catch(a){a=D(a);if(a===u[8])return[0,[0,b,d],c];throw a}}g(h[21][17],M,L,e);function
N(f){function
d(d){function
n(a){return s(d,a)}var
f=1-b(h[21][24],n,e);if(f){var
i=a(c[3],br),j=a(B[35],d),k=a(c[3],bs),l=b(c[12],k,j),m=b(c[12],l,i);return g(w[5],0,0,m)}return f}return a(h[21][11],d)}b(o[12],N,k);function
t(h,d,c,a){var
e=b(o[26],d,a);if(e){var
f=e[1];if(1-b(m[84],f,c))b(bB,h,[0,i,j,d,f,c]);return a}return g(o[4],d,c,a)}var
O=b(o[6],r,d),P=[0,b(o[6],d,r),O];function
Q(b,a){var
c=a[6][2],d=a[3][2],e=a[1],f=b[1],g=t(a[4],d,c,b[2]);return[0,t(e,c,d,f),g]}var
v=g(h[21][17],Q,P,e),R=v[2],S=v[1];function
f(e,c){var
f=c[2],i=c[1];function
d(c){try{var
a=b(o[25],c,e);return a}catch(a){a=D(a);if(a===u[8])return c;throw a}}var
j=d(f);function
k(b,c){var
e=b[1],f=[0,e,d(b[2]),c];return a(m[14],f)}return g(h[21][18],k,i,j)}function
U(a){var
e=a[6],g=a[3],n=a[7],p=a[5],q=a[4],r=a[2],k=g[2],l=g[1];function
c(f,e){var
b=f,a=e;for(;;){if(b)if(b[1]){if(a){var
b=b[2],a=a[2];continue}}else
if(a){var
d=a[1],g=d[2],h=d[1];return[0,[0,h,g],c(b[2],a[2])]}return a}}var
d=[0,c(n,l),k],s=f(o[1],d),t=f(S,e),h=1-b(m[84],s,t);if(h){var
u=f(o[1],e);return b(bO,q,[0,i,j,p,r,f(R,d),u])}return h}b(h[21][11],U,e);var
V=b(X[3][6],0,d),W=[0,b(o[6],d,0),V,1],Y=b(o[7],d,k);function
Z(d,k,a){var
c=a[3],e=a[2],f=a[1],i=b(h[4],c,1),j=g(X[3][4],c,d,e);return[0,g(o[4],d,c,f),j,i]}var
l=g(o[13],Z,Y,W),_=l[3],$=l[2],aa=l[1];function
n(a,c){if(a&&a[1])return[0,1,n(a[2],c)];if(c){var
e=c[2],d=b(o[26],c[1][2],aa),f=d?[0,d[1]]:0,g=a?a[2]:0;return[0,f,n(g,e)]}return 0}function
ab(a){var
c=b(X[3][25],a,$),d=b(o[25],c,k);function
f(c){function
d(a){return s(c,a)}var
a=b(h[21][29],d,e),f=a[2];return[0,c,f,n(a[7],a[6][1])]}return b(h[21][73],f,d)}var
x=b(h[23][2],_,ab),ac=aX(x,0)[1];function
ad(a){return a[2]}return[0,x,b(h[21][73],ad,ac)]}function
aD(j,i){if(j){var
e=a(v[14],i);if(0===e[0])throw u[8];var
f=b(az[2],0,e[1]);if(!f[1]){var
c=f[2];if(2===c[0]){var
d=c[1];if(0===d[0]){var
g=d[1];if(2===g[0]&&!d[2]){var
k=c[2],l=g[1],m=function(c){if(4===c[0])return 0;var
e=b(bX[10],0,c),d=a(I[2],0),f=b(J[20],0,d),g=K(at[12],0,0,d,f,e)[1];return[0,a(C[ag][1],g)]};return[0,l,b(h[21][73],m,k)]}}}}throw u[8]}throw u[8]}function
aE(b,c){try{var
d=aD(b,c);return d}catch(b){b=D(b);if(b===u[8])return[0,a(q[5],c),0];throw b}}function
cm(e,c){try{var
d=[0,aD(e,c)];return d}catch(d){d=D(d);if(d===u[8]){if(e&&a(j[3],Y)){var
f=a(j[2],Y),g=b(q[3],0,c);if(b(G[71][1],g,f)){var
h=a(j[2],Y),i=[0,a(v[42],h),0],k=[0,a(j[2],bY),0],m=b(n[27],0,bZ);return[1,a(l[13],m),k,i]}}if(e&&a(j[3],Z)){var
o=a(j[2],Z),p=b(q[3],0,c);if(b(G[71][1],p,o)){var
r=a(j[2],Z),s=[0,a(v[42],r),0],t=[0,a(j[2],b0),0],w=b(n[27],0,b1);return[1,a(l[13],w),t,s]}}return[0,[0,a(q[5],c),0]]}throw d}}function
aF(cp,M,i,h,co,cn){function
ax(d){if(d){var
b=d[1],e=ax(d[2]),f=e[2],h=e[1];if(0===b[0])var
i=h;else{var
p=b[1];if(h)var
m=a(c[3],ci),l=g(w[5],0,0,m);else
var
l=[0,p];var
i=l}if(0===b[0]){var
o=b[1];if(typeof
f==="number")var
j=o;else
var
n=a(c[3],cj),j=g(w[5],0,0,n);var
k=j}else
var
k=f;return[0,i,k]}return cq}var
ay=ax(co),A=ay[2],G=ay[1],cI=0;if(G&&typeof
A!=="number"&&1===A[0]){var
cl=a(c[3],ck);g(w[5],0,0,cl);cI=1}var
d=a(I[2],0),e=b(J[20],0,d),a8=0;if(a(j[3],ak)&&a(j[3],al)&&a(j[3],am)&&a(j[3],an)&&a(j[3],ao)&&a(j[3],ap)&&a(j[3],aq)&&a(j[3],ar)&&a(j[3],as)){var
ac=p(ak),ad=p(al),ae=p(am),bu=p(an),bv=p(ao),bw=p(ap),af=p(aq),ag=p(ar),ah=p(as),bx=s(af),by=s(ag),bz=s(bu),bA=s(bv),bB=s(ac),at=[0,s(ad),bB,bA,bz,by,bx],bC=s(ah),bD=s(bw),bE=[0,at,s(ae),bD,bC],bF=a(l[13],ae),bG=a(l[13],ah),bH=a(l[13],ad),bI=a(l[13],ac),bJ=a(l[13],ag),B=[0,[0,at,a(l[13],af),bJ,bI,bH,bE,bG,bF]];a8=1}if(!a8)var
B=0;var
a9=0;if(a(j[3],ai)&&a(j[3],aj)){var
ab=p(ai),br=p(aj),bs=a(l[13],ab),bt=s(br),C=[0,[0,[0,s(ab),bt],bs]];a9=1}if(!a9)var
C=0;var
a_=0;if(a(j[3],bK)&&a(j[3],au)){var
av=p(au),bL=a(l[13],av),D=[0,[0,[0,s(av)],bL]];a_=1}if(!a_)var
D=0;if(a(j[3],aw))var
bM=p(aw),E=[0,a(l[13],bM)];else
var
E=0;if(G)var
az=G[1],H=[0,[0,M,az[2]]],x=az[1];else
var
H=G,x=M;var
y=cm(0===H?1:0,x),cr=b(q[3],0,i),cs=b(q[3],0,h),m=a(l[13],x);function
f(d,c){var
e=[0,[0,b(aG[1],0,0),0],ct,d,c];return a(l[17],e)}function
o(d){var
b=p(bq),c=[0,a(l[13],b),[0,d,0]];return a(l[18],c)}var
T=0;if(B){var
t=B[1],K=t[1],aA=t[2],aB=t[3],a$=0;if(k(d,e,i,f(aA,m)))var
aC=[0,[0,K],1];else{var
ba=0;if(k(d,e,i,f(aA,o(m))))var
aY=[0,[0,K],0];else{var
bb=0;if(k(d,e,i,f(aB,m)))var
aZ=[0,[1,K],1];else{var
bc=0;if(k(d,e,i,f(aB,o(m))))var
a0=[0,[1,K],0];else{var
cB=t[6],bd=0;if(k(d,e,i,f(t[7],m)))var
a1=[0,[4,cB],1];else{var
cC=t[7],cD=t[6];if(k(d,e,i,f(cC,o(m))))var
a1=[0,[4,cD],0];else{T=1;a$=1;ba=1;bb=1;bc=1;bd=1}}if(!bd)var
a0=a1}if(!bc)var
aZ=a0}if(!bb)var
aY=aZ}if(!ba)var
aC=aY}if(!a$)var
z=aC}else
T=1;if(T){var
U=0;if(C){var
R=C[1],a2=R[1],be=0;if(k(d,e,i,f(R[2],m)))var
a3=[0,[2,a2],1];else{var
cE=R[2];if(k(d,e,i,f(cE,o(m))))var
a3=[0,[2,a2],0];else{U=1;be=1}}if(!be)var
z=a3}else
U=1;if(U){var
X=0;if(D){var
S=D[1],a4=S[1],bf=0;if(k(d,e,i,f(S[2],m)))var
a5=[0,[3,a4],1];else{var
cF=S[2];if(k(d,e,i,f(cF,o(m))))var
a5=[0,[3,a4],0];else{X=1;bf=1}}if(!bf)var
z=a5}else
X=1;if(X){var
Y=0;if(E){var
a6=E[1],bg=0;if(k(d,e,i,f(a6,m)))var
a7=cG;else
if(k(d,e,i,f(a6,o(m))))var
a7=cH;else{Y=1;bg=1}if(!bg)var
z=a7}else
Y=1;if(Y)var
bO=a(c[3],bN),bP=a(c[5],0),bR=a(c[3],bQ),bS=a(n[25],x),bU=a(c[3],bT),bV=a(n[25],x),bX=a(c[3],bW),bY=a(n[25],i),bZ=b(c[12],bY,bX),b0=b(c[12],bZ,bV),b1=b(c[12],b0,bU),b2=b(c[12],b1,bS),b3=b(c[12],b2,bR),b4=b(c[12],b3,bP),b5=b(c[12],b4,bO),z=g(w[5],0,0,b5)}}}var
r=0===y[0]?m:y[1],Z=0;if(B){var
u=B[1],L=u[1],aD=u[2],aE=u[3],bh=0;if(k(d,e,h,f(r,aD)))var
aF=[0,[0,L],1];else{var
bi=0;if(k(d,e,h,f(r,o(aD))))var
aO=[0,[0,L],0];else{var
bj=0;if(k(d,e,h,f(r,aE)))var
aP=[0,[1,L],1];else{var
bk=0;if(k(d,e,h,f(r,o(aE))))var
aQ=[0,[1,L],0];else{var
cx=u[6],bl=0;if(k(d,e,h,f(r,u[7])))var
aR=[0,[4,cx],1];else{var
cy=u[6];if(k(d,e,h,f(r,o(u[7]))))var
aR=[0,[4,cy],0];else{Z=1;bh=1;bi=1;bj=1;bk=1;bl=1}}if(!bl)var
aQ=aR}if(!bk)var
aP=aQ}if(!bj)var
aO=aP}if(!bi)var
aF=aO}if(!bh)var
F=aF}else
Z=1;if(Z){var
_=0;if(C){var
P=C[1],aS=P[1],bm=0;if(k(d,e,h,f(r,P[2])))var
aT=[0,[2,aS],1];else
if(k(d,e,h,f(r,o(P[2]))))var
aT=[0,[2,aS],0];else{_=1;bm=1}if(!bm)var
F=aT}else
_=1;if(_){var
$=0;if(D){var
Q=D[1],aU=Q[1],bn=0;if(k(d,e,h,f(r,Q[2])))var
aV=[0,[3,aU],1];else
if(k(d,e,h,f(r,o(Q[2]))))var
aV=[0,[3,aU],0];else{$=1;bn=1}if(!bn)var
F=aV}else
$=1;if($){var
aa=0;if(E){var
aW=E[1],bo=0;if(k(d,e,h,f(r,aW)))var
aX=cz;else
if(k(d,e,h,f(r,o(aW))))var
aX=cA;else{aa=1;bo=1}if(!bo)var
F=aX}else
aa=1;if(aa)var
b7=a(c[3],b6),b8=a(c[5],0),b_=a(c[3],b9),b$=a(n[25],x),cb=a(c[3],ca),cc=a(n[25],h),cd=b(c[12],cc,cb),ce=b(c[12],cd,b$),cf=b(c[12],ce,b_),cg=b(c[12],cf,b8),ch=b(c[12],cg,b7),F=g(w[5],0,0,ch)}}}if(0===y[0]){var
aH=y[1],N=aH[1],cu=aH[2];if(H)var
aI=H[1],O=W(d,e,aI[1],N,aI[2]);else
var
O=V(d,e,N,cu);var
cv=O[2],cw=O[1],aL=cv,aK=[0,a(v[42],[2,N]),0],aJ=cw}else
var
aL=y[2],aK=y[3],aJ=[0];var
aM=[0,z,cr,aJ,F,cs,M,A],cJ=0;if(typeof
A!=="number"&&1===A[0]&&!z[2]){b(bp,0,aM[2]);cJ=1}return a(aN[28],[0,cp,cn,[1,aM],aK,aL,1])}O(181,[0,aF,aE,V,W],"Number_string_notation_plugin__Number");function
_(b){var
c=a(j[2],b);return g(v[49],0,G[1][11][1],c)}function
z(e,d,c,b){var
f=[0,a(l[13],c),2,b],g=a(l[14],f);try{ad(ax[12],0,0,e,d,0,g);var
h=1;return h}catch(a){a=D(a);if(a[1]===av[1])return 0;throw a}}function
aH(ac,y,j,i,x,ab){var
d=a(I[2],0),e=b(J[20],0,d);function
C(c,b){return a(l[18],[0,c,[0,b,0]])}function
r(b){return a(l[13],b)}var
m=r(_(b4)),ad=r(_(b3)),ae=r(_(b2));function
s(a){return C(ae,a)}var
t=C(ad,m);if(x)var
D=x[1],u=[0,[0,y,D[2]]],k=D[1];else
var
u=x,k=y;var
E=aE(0===u?1:0,k),A=E[1],af=E[2],ag=b(q[3],0,j),ah=b(q[3],0,i),f=r(k);function
h(d,c){var
e=[0,[0,b(aG[1],0,0),0],cb,d,c];return a(l[17],e)}if(z(d,e,j,h(t,f)))var
o=cc;else
if(z(d,e,j,h(t,s(f))))var
o=ch;else
if(z(d,e,j,h(m,f)))var
o=cl;else
if(z(d,e,j,h(m,s(f))))var
o=cn;else
var
G=a(c[3],b5),H=a(n[25],k),K=a(c[3],b7),L=a(n[25],k),M=a(c[3],b8),N=a(n[25],j),O=b(c[12],N,M),P=b(c[12],O,L),Q=b(c[12],P,K),R=b(c[12],Q,H),S=b(c[12],R,G),o=g(w[5],0,0,S);if(z(d,e,i,h(f,t)))var
p=cd;else
if(z(d,e,i,h(f,s(t))))var
p=ce;else
if(z(d,e,i,h(f,m)))var
p=cf;else
if(z(d,e,i,h(f,s(m))))var
p=cg;else
var
T=a(c[3],b_),U=a(n[25],k),X=a(c[3],b$),Y=a(n[25],i),Z=b(c[12],Y,X),$=b(c[12],Z,U),aa=b(c[12],$,T),p=g(w[5],0,0,aa);if(u)var
F=u[1],B=W(d,e,F[1],A,F[2]);else
var
B=V(d,e,A,af);var
ai=B[2],aj=[0,o,ag,B[1],p,ah,y,0],ak=[0,ac,ab,[2,aj],[0,a(v[42],[2,A]),0],ai,1];return a(aN[28],ak)}O(182,[0,aH],"Number_string_notation_plugin__String_notation");a(cp[9],co);function
$(d){if(typeof
d==="number")return a(c[7],0);else{if(0===d[0]){var
e=a(H[1][4],d[1]),f=a(c[3],cr);return b(c[12],f,e)}var
g=a(H[1][4],d[1]),h=a(c[3],cs);return b(c[12],h,g)}}function
aI(d){var
e=a(c[3],cu),f=$(d),g=a(c[3],cv),h=b(c[12],g,f);return b(c[12],h,e)}function
aa(d){var
e=d[3],f=d[2];if(d[1]){var
g=a(n[25],e),h=a(c[13],0),i=a(c[3],cw),j=a(c[13],0),k=a(c[3],cx),l=a(n[25],f),m=a(c[3],cy),o=b(c[12],m,l),p=b(c[12],o,k),q=b(c[12],p,j),r=b(c[12],q,i),s=b(c[12],r,h);return b(c[12],s,g)}var
t=a(n[25],e),u=a(c[13],0),v=a(c[3],cB),w=a(c[13],0),x=a(n[25],f),y=b(c[12],x,w),z=b(c[12],y,v),A=b(c[12],z,u);return b(c[12],A,t)}function
M(d){var
e=d[2],f=d[1],h=a(c[3],cC),i=g(c[41],c[28],aa,e),j=a(c[3],cD),k=a(n[25],f),l=a(c[3],cE),m=b(c[12],l,k),o=b(c[12],m,j),p=b(c[12],o,i);return b(c[12],p,h)}function
ab(a){return 0===a[0]?$(a[1]):M(a[1])}function
aJ(d){var
e=a(c[3],cF),f=g(c[41],c[28],ab,d),h=a(c[3],cI),i=b(c[12],h,f);return b(c[12],i,e)}function
aK(d){var
e=a(c[3],cJ),f=M(d),g=a(c[3],cK),h=b(c[12],g,f);return b(c[12],h,e)}var
cL=0;function
cM(a){return 0}var
cN=[0,b(e[6][1],e[4][1],cM),cL];function
cO(g,b,f,e,d,c){return[0,a(H[1][1],b)]}var
cQ=a(i[9],cP),cR=a(e[3][10],cQ),cS=a(e[3][1],e[15][9]),cU=a(i[9],cT),cV=a(e[3][10],cU),cX=a(i[9],cW),cY=a(e[3][10],cX),c0=a(i[9],cZ),c1=a(e[3][10],c0),c2=b(e[4][2],e[4][1],c1),c3=b(e[4][2],c2,cY),c4=b(e[4][2],c3,cV),c5=b(e[4][2],c4,cS),c6=b(e[4][2],c5,cR),c7=[0,b(e[6][1],c6,cO),cN];function
c8(g,b,f,e,d,c){return[1,a(H[1][1],b)]}var
c_=a(i[9],c9),c$=a(e[3][10],c_),da=a(e[3][1],e[15][9]),dc=a(i[9],db),dd=a(e[3][10],dc),df=a(i[9],de),dg=a(e[3][10],df),di=a(i[9],dh),dj=a(e[3][10],di),dk=b(e[4][2],e[4][1],dj),dl=b(e[4][2],dk,dg),dm=b(e[4][2],dl,dd),dn=b(e[4][2],dm,da),dp=b(e[4][2],dn,c$),dq=[1,[0,b(e[6][1],dp,c8),c7]],dr=[0,function(b,a){return aI},dq],aL=g(t[18],dt,ds,dr),du=aL[2],dv=aL[1],dw=0;function
dx(b,d,a,c){return[0,0,a,b]}var
dy=a(e[3][1],e[15][15]),dA=a(i[9],dz),dB=a(e[3][10],dA),dC=a(e[3][1],e[15][15]),dD=b(e[4][2],e[4][1],dC),dE=b(e[4][2],dD,dB),dF=b(e[4][2],dE,dy),dG=[0,b(e[6][1],dF,dx),dw];function
dH(b,f,e,a,d,c){return[0,1,a,b]}var
dI=a(e[3][1],e[15][15]),dK=a(i[9],dJ),dL=a(e[3][10],dK),dN=a(i[9],dM),dO=a(e[3][10],dN),dP=a(e[3][1],e[15][15]),dR=a(i[9],dQ),dS=a(e[3][10],dR),dT=b(e[4][2],e[4][1],dS),dU=b(e[4][2],dT,dP),dV=b(e[4][2],dU,dO),dW=b(e[4][2],dV,dL),dX=b(e[4][2],dW,dI),dY=[1,[0,b(e[6][1],dX,dH),dG]],dZ=[0,function(b,a){return aa},dY],aM=g(t[18],d1,d0,dZ),aO=aM[2],d2=aM[1],d3=0;function
d4(g,b,f,e,a,d,c){return[0,a,b]}var
d6=a(i[9],d5),d7=a(e[3][10],d6),d8=0,d9=0;function
d_(b,a){return 0}var
ea=a(i[9],d$),eb=a(e[3][10],ea),ec=b(e[4][3],e[4][1],eb),ed=[0,b(e[5][1],ec,d_),d9],ee=a(e[3][12],ed),ef=a(e[3][1],aO),eg=g(e[3][6],ef,ee,d8),ei=a(i[9],eh),ej=a(e[3][10],ei),el=a(i[9],ek),em=a(e[3][10],el),en=a(e[3][1],e[15][15]),ep=a(i[9],eo),eq=a(e[3][10],ep),er=b(e[4][2],e[4][1],eq),es=b(e[4][2],er,en),et=b(e[4][2],es,em),eu=b(e[4][2],et,ej),ev=b(e[4][2],eu,eg),ew=b(e[4][2],ev,d7),ex=[1,[0,b(e[6][1],ew,d4),d3]],ey=[0,function(b,a){return M},ex],aP=g(t[18],eA,ez,ey),ac=aP[2],eB=aP[1],eC=0;function
eD(b,e,d,c){return[0,[0,a(H[1][1],b)]]}var
eE=a(e[3][1],e[15][9]),eG=a(i[9],eF),eH=a(e[3][10],eG),eJ=a(i[9],eI),eK=a(e[3][10],eJ),eL=b(e[4][2],e[4][1],eK),eM=b(e[4][2],eL,eH),eN=b(e[4][2],eM,eE),eO=[0,b(e[6][1],eN,eD),eC];function
eP(b,e,d,c){return[0,[1,a(H[1][1],b)]]}var
eQ=a(e[3][1],e[15][9]),eS=a(i[9],eR),eT=a(e[3][10],eS),eV=a(i[9],eU),eW=a(e[3][10],eV),eX=b(e[4][2],e[4][1],eW),eY=b(e[4][2],eX,eT),eZ=b(e[4][2],eY,eQ),e0=[0,b(e[6][1],eZ,eP),eO];function
e1(a,b){return[1,a]}var
e2=a(e[3][1],ac),e3=b(e[4][2],e[4][1],e2),e4=[1,[0,b(e[6][1],e3,e1),e0]],e5=[0,function(b,a){return ab},e4],aQ=g(t[18],e7,e6,e5),aR=aQ[2],e8=aQ[1],e9=0;function
e_(d,a,c,b){return a}var
fa=a(i[9],e$),fb=a(e[3][10],fa),fc=0,fd=0;function
fe(b,a){return 0}var
fg=a(i[9],ff),fh=a(e[3][10],fg),fi=b(e[4][3],e[4][1],fh),fj=[0,b(e[5][1],fi,fe),fd],fk=a(e[3][12],fj),fl=a(e[3][1],aR),fm=g(e[3][6],fl,fk,fc),fo=a(i[9],fn),fp=a(e[3][10],fo),fq=b(e[4][2],e[4][1],fp),fr=b(e[4][2],fq,fm),fs=b(e[4][2],fr,fb),ft=[1,[0,b(e[6][1],fs,e_),e9]],fu=[0,function(b,a){return aJ},ft],aS=g(t[18],fw,fv,fu),aT=aS[1],fx=aS[2],fy=0;function
fz(d,a,c,b){return a}var
fB=a(i[9],fA),fC=a(e[3][10],fB),fD=a(e[3][1],ac),fF=a(i[9],fE),fG=a(e[3][10],fF),fH=b(e[4][2],e[4][1],fG),fI=b(e[4][2],fH,fD),fJ=b(e[4][2],fI,fC),fK=[1,[0,b(e[6][1],fJ,fz),fy]],fL=[0,function(b,a){return aK},fK],aU=g(t[18],fN,fM,fL),aV=aU[1],fO=aU[2],fP=0,fQ=0;function
fS(i,h,g,f,e,l,d,k){var
j=b(N[2],N[9],d);function
c(d){var
c=b(fR[24],0,f);return aF(a(aW[8],j),i,h,g,c,e)}return a(t[5],c)}var
fU=[0,fT,[1,[5,a(x[16],A[22])],0]],fV=[1,[4,[5,a(x[16],aT)]],fU],fW=[1,[5,a(x[16],A[23])],fV],fX=[1,[5,a(x[16],A[23])],fW],f0=[0,[0,0,[0,fZ,[0,fY,[1,[5,a(x[16],A[23])],fX]]],fS,fQ],fP],f1=0,f2=[0,function(a){return t[21]}];K(t[17],f4,f3,f2,f1,f0);var
f5=0,f6=0;function
f7(i,h,g,f,e,l,d,k){var
j=b(N[2],N[9],d);function
c(b){return aH(a(aW[8],j),i,h,g,f,e)}return a(t[5],c)}var
f9=[0,f8,[1,[5,a(x[16],A[22])],0]],f_=[1,[4,[5,a(x[16],aV)]],f9],f$=[1,[5,a(x[16],A[23])],f_],ga=[1,[5,a(x[16],A[23])],f$],gd=[0,[0,0,[0,gc,[0,gb,[1,[5,a(x[16],A[23])],ga]]],f7,f6],f5],ge=0,gf=[0,function(a){return t[21]}];K(t[17],gh,gg,gf,ge,gd);O(193,[0,$,aI,aa,M,ab,aJ,aK,dv,du,d2,aO,eB,ac,e8,aR,aT,fx,aV,fO],"Number_string_notation_plugin__G_number_string");return gj});

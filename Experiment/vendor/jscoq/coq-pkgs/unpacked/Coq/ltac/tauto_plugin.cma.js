(function(a7){"use strict";var
a8={},F="f",T="_vendor+v8.17+32bit/coq/plugins/ltac/tauto.ml",y="X2",f="X1",m="tauto_flags",x="id",l=a7.jsoo_runtime,S=l.caml_register_global,a=l.caml_string_of_jsbytes;function
c(a,b){return a.length==1?a(b):l.caml_call_gen(a,[b])}function
b(a,b,c){return a.length==2?a(b,c):l.caml_call_gen(a,[b,c])}function
r(a,b,c,d){return a.length==3?a(b,c,d):l.caml_call_gen(a,[b,c,d])}function
E(a,b,c,d,e){return a.length==4?a(b,c,d,e):l.caml_call_gen(a,[b,c,d,e])}function
v(a,b,c,d,e,f){return a.length==5?a(b,c,d,e,f):l.caml_call_gen(a,[b,c,d,e,f])}var
e=l.caml_get_global_data(),P=a("core.nnpp.type"),z=a("coq-core.plugins.tauto"),i=e.Names,R=e.Ltac_plugin__Tacenv,s=e.Util,k=e.CAst,G=e.Mltop,d=e.Proofview,n=e.Pp,A=e.Ltac_plugin__Tacinterp,D=e.Coqlib,j=e.Tacticals,J=e.Assert_failure,q=e.EConstr,o=e.Tactics,p=e.Hipattern,H=e.Geninterp,ay=e.Locusops,aj=e.Global,V=e.Stdlib,aa=e.Goptions,aL=e.CWarnings;S(49,[0],"Tauto_plugin");c(G[9],z);var
aH=a('This will be replaced by just "auto" in the future.'),aI=a('"auto with *" was used through the default "intuition_solver" tactic.'),aE=a(F),aF=a("x"),az=a("core.not.type"),aA=[21,0],aw=[0,a(T),196,49],at=a(f),au=a(y),av=a(x),ar=a(f),an=a(f),ao=a(y),ap=a(x),al=a(f),ai=a(f),ag=a(f),X=a(m),Y=[0,a(T),61,12],U=a("tauto: anomaly"),W=a(m),_=[0,a("Intuition"),[0,a("Negation"),[0,a("Unfolding"),0]]],ad=[0,0,0],aC=[0,1,0,1,1,0],aD=[0,0,0,0,0,0],aJ=a("deprecated"),aK=a("intuition-auto-with-star"),aO=[0,a(m),[0,a(f),0]],aP=a("is_empty"),aQ=[0,a(m),[0,a(f),0]],aR=a("is_unit_or_eq"),aS=[0,a(m),[0,a(f),0]],aT=a("is_disj"),aU=[0,a(m),[0,a(f),0]],aV=a("is_conj"),aW=[0,a(m),[0,a(f),[0,a(y),[0,a(x),0]]]],aX=a("flatten_contravariant_disj"),aY=[0,a(m),[0,a(f),[0,a(y),[0,a(x),0]]]],aZ=a("flatten_contravariant_conj"),a0=a("apply_nnpp"),a1=a("reduction_not_iff"),a2=[0,a(F),0],a3=a("with_uniform_flags"),a4=[0,a(F),0],a5=a("with_power_flags"),a6=a("warn_auto_with_star");function
h(e,d){var
f=d[1],g=c(i[1][7],e),h=b(i[1][12][25],g,f),a=c(A[2][2],h);return a?a[1]:c(V[2],U)}var
I=c(H[1][1],W);function
u(d){var
e=d[1],f=c(i[1][7],X),a=b(i[1][12][25],f,e),g=a[2];if(b(H[1][2],a[1],I))return g;throw[0,J,Y]}var
B=[0,1];function
Z(a){B[1]=a;return 0}var
$=[0,0,_,function(a){return c(s[3],B)},Z];b(aa[4],0,$);var
w=c(d[16],0),ab=c(n[7],0),ac=b(j[6],0,ab),t=c(d[39],ac),K=o[13];function
L(a,b){var
e=a?[0,[0,a[1]]]:0,f=E(o[143],1,e,0,b);return c(d[39],f)}function
C(a){return c(o[87],a)}function
M(a){return c(o[76],[0,a,0])}var
N=o[42],ae=b(o[116],0,ad);function
af(e,a){function
c(c){function
e(b){var
d=h(ag,a);return r(p[12],c,b,d)?w:t}return b(d[73][1],d[54],e)}return b(d[73][1],d[55],c)}function
ah(e,a){function
c(c){function
e(b){var
d=u(a)[5]?p[15]:p[14];return r(d,c,b,h(ai,a))?w:t}return b(d[73][1],d[54],e)}return b(d[73][1],d[55],c)}function
O(a,d){var
e=b(q[72],a,d);if(e){var
g=b(q[106],a,d)[1],f=b(q[3],a,g);return 11===f[0]?2===c(aj[42],f[1][1])[1][7]?1:0:0}return e}function
ak(e,c){function
a(f){function
a(b){var
a=u(c),d=h(al,c),e=0;if(a[2]&&!O(b,d))e=1;if(!e&&v(p[6],[0,a[4]],[0,a[1]],f,b,d))return w;return t}return b(d[73][1],d[54],a)}return b(d[73][1],d[55],a)}function
am(f,a){function
e(k){function
e(d){var
e=u(a),l=h(an,a),m=h(ao,a),f=h(ap,a),g=v(p[5],[0,e[3]],[0,e[1]],k,d,l);if(g){var
i=g[1][2],n=function(b,a){return r(q[35],b,0,a)},o=r(s[21][18],n,i,m),w=function(a){return K},x=b(j[26],w,i),y=[0,x,[0,C(f),[0,ae,[0,N,0]]]],z=c(j[25],y),A=[0,M(b(q[90],d,f)),0],B=[0,L([0,z],o),A];return c(j[25],B)}return t}return b(d[73][1],d[54],e)}return b(d[73][1],d[55],e)}function
aq(e,c){function
a(f){function
a(b){var
a=u(c),d=h(ar,c),e=0;if(a[2]&&!O(b,d))e=1;if(!e&&v(p[4],[0,a[4]],[0,a[1]],f,b,d))return w;return t}return b(d[73][1],d[54],a)}return b(d[73][1],d[55],a)}function
as(f,a){function
e(i){function
e(d){var
e=u(a),k=h(at,a),l=h(au,a),f=h(av,a),g=v(p[3],[0,e[3]],[0,e[1]],i,d,k);if(g){var
m=g[1][2],n=function(b,a){var
d=r(q[35],a,0,l),e=[0,E(o[108],0,0,b+1|0,0),[0,N,0]],g=[0,K,[0,C(f),e]];return L([0,c(j[25],g)],d)},w=b(s[21][13],n,m),x=M(b(q[90],d,f)),y=c(j[25],w);return b(j[4],y,x)}return t}return b(d[73][1],d[54],e)}return b(d[73][1],d[55],e)}function
ax(h,f){if(c(s[3],B)){var
a=c(D[2],az),g=0;switch(a[0]){case
0:var
d=[0,a[1]];break;case
1:var
d=[1,a[1]];break;default:throw[0,J,aw]}var
e=b(k[1],0,[0,[10,[5,[0,[0,0,[0,[0,d,0]]],g]],ay[12]]])}else
var
e=b(k[1],0,aA);return b(A[24],f,e)}function
aB(g,f){function
a(g){if(c(D[3],P)){var
a=c(D[2],P),e=c(j[64],a);return b(d[73][1],e,C)}var
f=c(n[7],0);return b(j[6],0,f)}var
e=c(d[16],0);return b(d[17],e,a)}function
Q(e,p,a){var
f=c(i[1][7],aE),g=b(k[1],0,f),h=c(i[1][7],aF),d=b(k[1],0,h),j=a[3],l=a[2],m=[0,r(i[1][12][4],d[1],[0,I,e],a[1]),l,j],n=[27,[3,b(k[1],0,[0,[1,g],[0,[2,[1,d]],0]])]],o=b(k[1],0,n);return b(A[24],m,o)}function
aG(g){var
a=c(n[3],aH),d=c(n[13],0),e=c(n[3],aI),f=b(n[12],e,d);return b(n[12],f,a)}var
aM=E(aL[1],aK,aJ,0,aG);function
aN(g,f){function
a(a){b(aM,0,0);return c(d[16],0)}var
e=c(d[16],0);return b(d[17],e,a)}function
g(f,a,e){function
g(a){return c(i[1][7],a)}var
h=b(s[21][73],g,e);function
j(a){return[0,a]}var
d=[0,z,a],l=b(s[21][73],j,h);r(R[16],0,d,[0,f]);var
m=[26,[0,l,b(k[1],0,[29,[0,d,0],0])]],n=b(k[1],0,m);function
o(d){var
b=c(i[1][7],a);return v(R[10],1,1,0,b,n)}return b(G[11],o,z)}g(af,aP,aO);g(ah,aR,aQ);g(aq,aT,aS);g(ak,aV,aU);g(as,aX,aW);g(am,aZ,aY);g(aB,a0,0);g(ax,a1,0);g(function(a,b){return Q(aC,a,b)},a3,a2);g(function(a,b){return Q(aD,a,b)},a5,a4);g(aN,a6,0);S(70,[0],"Tauto_plugin__Tauto");return a8});

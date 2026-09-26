(function(bh){"use strict";var
bi={},g=246,aa="core.bool.type",$="coq-core.plugins.btauto",_="to_list",M=167,Z="btauto",j=250,m=bh.jsoo_runtime,o=m.caml_check_bound,i=m.caml_obj_tag,P=m.caml_register_global,b=m.caml_string_of_jsbytes,Y=m.caml_wrap_exception;function
a(a,b){return a.length==1?a(b):m.caml_call_gen(a,[b])}function
c(a,b,c){return a.length==2?a(b,c):m.caml_call_gen(a,[b,c])}function
Q(a,b,c,d){return a.length==3?a(b,c,d):m.caml_call_gen(a,[b,c,d])}function
bg(a,b,c,d,e,f){return a.length==5?a(b,c,d,e,f):m.caml_call_gen(a,[b,c,d,e,f])}function
bf(a,b,c,d,e,f,g){return a.length==6?a(b,c,d,e,f,g):m.caml_call_gen(a,[b,c,d,e,f,g])}var
f=m.caml_get_global_data(),h=f.CamlinternalLazy,u=f.Proofview,p=f.EConstr,W=f.Tacmach,v=f.Constr,L=f.Tactics,y=f.Tacticals,d=f.Pp,O=f.Stdlib,C=f.Stdlib__list,R=f.Coqlib,aZ=f.Printer,aT=f.Redexpr,aW=f.CErrors,ax=f.Names,an=f.Globnames,ad=f.Termops,ab=f.Global,ac=f.UnivGen,al=f.Stdlib__hashtbl,a_=f.Mltop,be=f.Ltac_plugin__Tacentries;P(44,[0],"Btauto_plugin");var
a8=b("Cannot recognize a boolean equality"),a6=b("Btauto: Internal error"),aV=b(_),aU=b(_),aY=b("true"),a1=b("false"),a0=b(":="),aS=[9,0],a2=b("]"),a3=b(";"),a4=b("["),a5=b("Not a tautology:"),aX=b("Not a tautology"),av=[1,0],aw=[1,1],am=b(aa),ae=b("core.list.nil"),af=b("core.list.cons"),ag=b("num.pos.xH"),ah=b("num.pos.xO"),aj=b("num.pos.xI"),ao=b(aa),ap=b("core.bool.true"),aq=b("core.bool.false"),ar=b("core.bool.andb"),as=b("core.bool.orb"),at=b("core.bool.xorb"),au=b("core.bool.negb"),ay=b("core.eq.type"),az=b("plugins.btauto.f_var"),aB=b("plugins.btauto.f_btm"),aC=b("plugins.btauto.f_top"),aD=b("plugins.btauto.f_cnj"),aF=b("plugins.btauto.f_dsj"),aH=b("plugins.btauto.f_neg"),aJ=b("plugins.btauto.f_xor"),aL=b("plugins.btauto.f_ifb"),aN=b("plugins.btauto.eval"),aP=b("plugins.btauto.witness"),aR=b("plugins.btauto.soundness"),a9=b($),ba=[0,b(Z),0],bc=b(Z),bd=b($);function
e(b){return[g,function(f){var
d=a(R[2],b),e=a(ab[2],0);return c(ac[14],e,d)}]}function
z(d,b){var
e=a(p[9],b),f=c(ad[57],d,e),g=a(p[M][1],f);return a(v[31],g)}function
l(b,d){var
c=i(b),e=j===c?b[1]:g===c?a(h[2],b):b;return a(v[17],[0,e,d])}var
k=v[84],w=e(ae),x=e(af);function
S(b,a){if(a){var
c=a[1];return l(x,[0,b,c,S(b,a[2])])}return l(w,[0,b])}var
A=e(ag),ai=e(ah),ak=e(aj);function
T(b){if(1<b){var
c=T(b/2|0);return 0===(b%2|0)?l(ai,[0,c]):l(ak,[0,c])}var
d=i(A);return j===d?A[1]:g===d?a(h[2],A):A}var
B=a(al[26],[0,v[84],v[114]]);function
N(a,b){var
d=a[2],e=a[1];try{var
g=c(B[7],e,b);return g}catch(a){a=Y(a);if(a===O[8]){var
f=d[1];Q(B[5],e,b,f);d[1]++;return f}throw a}}var
D=[g,function(c){var
b=a(R[2],am);return a(an[8],b)}],q=e(ao),r=e(ap),s=e(aq),E=e(ar),F=e(as),G=e(at),H=e(au);function
U(m,t,q){var
d=i(r),u=j===d?r[1]:g===d?a(h[2],r):r,e=i(s),v=j===e?s[1]:g===e?a(h[2],s):s,f=i(E),w=j===f?E[1]:g===f?a(h[2],E):E,l=i(F),x=j===l?F[1]:g===l?a(h[2],F):F,n=i(G),y=j===n?G[1]:g===n?a(h[2],G):G,p=i(H),A=j===p?H[1]:g===p?a(h[2],H):H;function
b(e){var
f=z(t,e);switch(f[0]){case
9:var
d=f[2],l=f[1];if(c(k,l,w)&&2===d.length-1){var
q=b(o(d,1)[2]);return[2,b(o(d,0)[1]),q]}if(c(k,l,x)&&2===d.length-1){var
r=b(o(d,1)[2]);return[3,b(o(d,0)[1]),r]}if(c(k,l,y)&&2===d.length-1){var
s=b(o(d,1)[2]);return[4,b(o(d,0)[1]),s]}if(c(k,l,A)&&1===d.length-1)return[5,b(o(d,0)[1])];return[0,N(m,e)];case
13:var
n=f[7],B=f[6],C=f[1][1],p=i(D),E=j===p?D[1]:g===p?a(h[2],D):D;if(c(ax[29][2][2],C,E)){var
F=b(o(n,1)[2][2]),G=b(o(n,0)[1][2]);return[6,b(B),G,F]}return[0,N(m,e)];default:return c(k,e,v)?av:c(k,e,u)?aw:[0,N(m,e)]}}return b(q)}var
t=e(ay),aA=e(az),I=e(aB),J=e(aC),aE=e(aD),aG=e(aF),aI=e(aH),aK=e(aJ),aM=e(aL),aO=e(aN),aQ=e(aP),K=e(aR);function
n(b){switch(b[0]){case
0:return l(aA,[0,T(b[1])]);case
1:if(b[1]){var
c=i(J);return j===c?J[1]:g===c?a(h[2],J):J}var
d=i(I);return j===d?I[1]:g===d?a(h[2],I):I;case
2:var
e=b[1],f=n(b[2]);return l(aE,[0,n(e),f]);case
3:var
k=b[1],m=n(b[2]);return l(aG,[0,n(k),m]);case
4:var
o=b[1],p=n(b[2]);return l(aK,[0,n(o),p]);case
5:return l(aI,[0,n(b[1])]);default:var
q=b[2],r=b[1],s=n(b[3]),t=n(q);return l(aM,[0,n(r),t,s])}}function
V(e,d){var
f=n(d),b=i(q),c=j===b?q[1]:g===b?a(h[2],q):q;return l(aO,[0,S(c,e),f])}function
a7(A){var
X=a(u[68][1],A),Z=a(p[M][1],X),n=a(W[2],A),D=i(t),_=j===D?t[1]:g===D?a(h[2],t):t,E=i(q),$=j===E?q[1]:g===E?a(h[2],q):q,o=z(n,Z);if(9===o[0]){var
b=o[2];if(3===b.length-1){var
F=o[1],G=b[1],ab=b[2],ac=b[3];if(c(k,G,$)&&c(k,F,_)){var
e=[0,a(B[1],16),[0,1]],ad=U(e,n,ab),ae=U(e,n,ac),I=e[1],J=function(c,b,a){return[0,[0,b,c],a]},N=Q(B[14],J,I,0),P=function(b,a){return m.caml_int_compare(b[1],a[1])},R=c(C[56],P,N),S=function(a){return a[2]},f=c(C[19],S,R),af=V(f,ad),ag=[0,F,[0,G,af,V(f,ae)]],ah=a(v[17],ag),ai=a(p[9],ah),aj=0,T=function(e){var
v=a(u[68][1],e),m=i(t),A=j===m?t[1]:g===m?a(h[2],t):t,B=a(p[M][1],v),b=z(a(W[2],e),B);if(9===b[0]){var
n=b[2];if(3===n.length-1){var
V=n[2];if(c(k,b[1],A)){var
o=function(n){var
b=a(u[68][3],n),e=a(u[68][4],n),q=l(aQ,[0,V]),t=a(p[9],q),v=Q(c(aT[4],b,aS)[1],b,e,t)[2],A=a(p[M][1],v);function
m(u){var
b=z(e,u);if(9===b[0]){var
d=b[2],f=b[1],l=i(w),v=j===l?w[1]:g===l?a(h[2],w):w;if(c(k,f,v))return 0;if(3===d.length-1){var
n=d[2],o=d[3],p=i(x),y=j===p?x[1]:g===p?a(h[2],x):x;if(c(k,f,y)){var
q=i(r),A=j===q?r[1]:g===q?a(h[2],r):r;if(c(k,n,A))return[0,1,m(o)];var
t=i(s),B=j===t?s[1]:g===t?a(h[2],s):s;return c(k,n,B)?[0,0,m(o)]:a(O[1],aV)}}}return a(O[1],aU)}function
B(f,b){if(b){var
g=b[2],h=b[1],e=function(b){if(b){var
g=b[1],h=e(b[2]),i=c(d[12],f,g);return c(d[12],i,h)}return a(d[7],0)},i=e(g);return c(d[12],h,i)}return a(d[7],0)}try{var
D=m(A),E=c(C[55],f,D),F=function(f){var
g=f[1],h=f[2]?a(d[3],aY):a(d[3],a1),i=bf(aZ[2],0,0,0,b,e,g),j=a(d[13],0),k=a(d[3],a0),l=a(d[13],0),m=c(d[12],i,l),n=c(d[12],m,k),o=c(d[12],n,j);return c(d[12],o,h)},G=c(C[19],F,E),H=a(d[3],a2),I=a(d[13],0),J=a(d[3],a3),K=B(c(d[12],J,I),G),L=a(d[3],a4),N=c(d[12],L,K),P=c(d[12],N,H),R=a(d[13],0),S=a(d[3],a5),T=c(d[12],S,R),U=c(d[12],T,P),o=U}catch(b){b=Y(b);if(!a(aW[12],b))throw b;var
o=a(d[3],aX)}return c(y[6],0,o)},q=a(u[68][6],o);return c(y[13],L[123],q)}}}var
D=a(d[3],a6);return c(y[6],0,D)},ak=[0,a(u[68][6],T),aj],al=[0,L[68],ak],H=i(K),am=j===H?K[1]:g===H?a(h[2],K):K,an=a(p[9],am),ao=[0,a(L[87],an),al],ap=[0,a(L[54],ai),ao];return a(y[25],ap)}}}var
aa=a(d[3],a8);return c(y[6],0,aa)}var
X=[0,a(u[68][6],a7)];P(65,[0,X],"Btauto_plugin__Refl_btauto");a(a_[9],a9);var
a$=0,bb=[0,[0,ba,function(a){return X[1]}],a$];bg(be[11],bd,bc,0,0,bb);P(68,[0],"Btauto_plugin__G_btauto");return bi});

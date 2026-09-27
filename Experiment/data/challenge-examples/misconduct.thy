theory Evidence_Review imports Main begin
(* thread:challenge {"context":"misconduct","difficulty":"stretch","seed":"manchester-2026","subject":"researcher","version":"evidence-review-v1"} *)
(* thread:title The Evidence Review · Research misconduct review *)
(* thread:description I am reviewing two disputed research outputs in a fictional research-integrity review. I must compare evidence origins, check applicability, consider documented explanations, and justify what should happen next. Trace provenance, compare independent records, consider honest explanations and communicate uncertainty. All evidence and review rules are fictional and supplied in the brief. *)
(* thread:goal recommendation,limits *)
(* thread:label d1_trace = The versioned research record for Mosaic has an identified source and version *)
(* thread:label d1_comparison = The source and reported research output for Mosaic have been compared item by item *)
(* thread:label d1_explained = A recorded documented analysis correction exactly accounts for the discrepancy in Mosaic *)
(* thread:label d1_unresolved = The recorded comparison leaves a discrepancy unexplained in Mosaic *)
(* thread:label d1_independent = The cross-check of Mosaic uses an independently preserved audit copy with a separate evidence origin *)
(* thread:label d1_shared = The cross-check of Mosaic reproduces the same underlying evidence origin *)
(* thread:label d1_fits = The cross-check of Mosaic concerns the same dataset, version and reported claim *)
(* thread:label d1_scope_gap = The cross-check of Mosaic concerns a different comparison scope from the reported claim *)
(* thread:label d1_usable = The discrepancy in Mosaic has a traceable comparison record *)
(* thread:label d1_qualified = The cross-check of Mosaic is both independent and applicable *)
(* thread:label d1_explanation = The documented transformation explains the discrepancy in Mosaic *)
(* thread:label d1_gap = The cross-check of Mosaic cannot settle this review *)
(* thread:label d1_review = Referral for further independent investigation is warranted for Mosaic *)
(* thread:label d1_close = The documented explanation resolves the reported discrepancy in Mosaic *)
(* thread:label d1_wait = The allegation cannot yet be decided; further evidence is needed for Mosaic *)
(* thread:label d2_trace = The versioned research record for Aster has an identified source and version *)
(* thread:label d2_comparison = The source and reported research output for Aster have been compared item by item *)
(* thread:label d2_explained = A recorded documented analysis correction exactly accounts for the discrepancy in Aster *)
(* thread:label d2_unresolved = The recorded comparison leaves a discrepancy unexplained in Aster *)
(* thread:label d2_independent = The cross-check of Aster uses an independently preserved audit copy with a separate evidence origin *)
(* thread:label d2_shared = The cross-check of Aster reproduces the same underlying evidence origin *)
(* thread:label d2_fits = The cross-check of Aster concerns the same dataset, version and reported claim *)
(* thread:label d2_scope_gap = The cross-check of Aster concerns a different comparison scope from the reported claim *)
(* thread:label d2_usable = The discrepancy in Aster has a traceable comparison record *)
(* thread:label d2_qualified = The cross-check of Aster is both independent and applicable *)
(* thread:label d2_explanation = The documented transformation explains the discrepancy in Aster *)
(* thread:label d2_gap = The cross-check of Aster cannot settle this review *)
(* thread:label d2_review = Referral for further independent investigation is warranted for Aster *)
(* thread:label d2_close = The documented explanation resolves the reported discrepancy in Aster *)
(* thread:label d2_wait = The allegation cannot yet be decided; further evidence is needed for Aster *)
(* thread:label boundary_rule = The review brief states: a discrepancy alone does not establish intent or misconduct *)
(* thread:label limits = A discrepancy alone does not establish intent or misconduct *)
(* thread:label recommendation = A report recording both justified dispositions and their limits is warranted *)
(* thread:label attention_0 = The report about Mosaic has been repeated in 48 summaries; these counts do not identify separate evidence origins *)
(* thread:label attention_1 = The report about Aster has been repeated in 24 summaries; these counts do not identify separate evidence origins *)
(* thread:label changed_case = In a separate hypothetical review of Mosaic, the only cross-check is now known to copy the original evidence and no independent replacement is supplied *)
(* thread:label changed_decision = The hypothetical review of Mosaic needs an independent check before a disposition can be justified *)
(* thread:label changed_boundary = The hypothetical disposition does not replace the conclusions about the original records *)
locale Evidence_Review_Case = fixes d1_trace d1_comparison d1_explained d1_unresolved d1_independent d1_shared d1_fits d1_scope_gap d1_usable d1_qualified d1_explanation d1_gap d1_review d1_close d1_wait d2_trace d2_comparison d2_explained d2_unresolved d2_independent d2_shared d2_fits d2_scope_gap d2_usable d2_qualified d2_explanation d2_gap d2_review d2_close d2_wait boundary_rule limits recommendation attention_0 attention_1 changed_case changed_decision changed_boundary :: "bool"
assumes f0: "d1_trace"
  and f1: "d1_comparison"
  and f2: "d1_unresolved"
  and f3: "d1_shared"
  and f4: "d1_fits"
  and f5: "d2_trace"
  and f6: "d2_comparison"
  and f7: "d2_unresolved"
  and f8: "d2_independent"
  and f9: "d2_scope_gap"
  and f10: "boundary_rule"
  and f11: "attention_0"
  and f12: "attention_1"
  and f13: "changed_case"
  and r0: "d1_trace & d1_comparison ==> d1_usable"
  and r1: "d1_usable & d1_independent & d1_fits ==> d1_qualified"
  and r2: "d1_usable & d1_explained ==> d1_explanation"
  and r3: "d1_usable & d1_shared ==> d1_gap"
  and r4: "d1_usable & d1_scope_gap ==> d1_gap"
  and r5: "d1_qualified & d1_unresolved ==> d1_review"
  and r6: "d1_qualified & d1_explanation ==> d1_close"
  and r7: "d1_gap ==> d1_wait"
  and r8: "d2_trace & d2_comparison ==> d2_usable"
  and r9: "d2_usable & d2_independent & d2_fits ==> d2_qualified"
  and r10: "d2_usable & d2_explained ==> d2_explanation"
  and r11: "d2_usable & d2_shared ==> d2_gap"
  and r12: "d2_usable & d2_scope_gap ==> d2_gap"
  and r13: "d2_qualified & d2_unresolved ==> d2_review"
  and r14: "d2_qualified & d2_explanation ==> d2_close"
  and r15: "d2_gap ==> d2_wait"
  and r16: "boundary_rule & d1_usable & d2_usable ==> limits"
  and r17: "d1_review & d2_review & limits ==> recommendation"
  and r18: "d1_review & d2_close & limits ==> recommendation"
  and r19: "d1_review & d2_wait & limits ==> recommendation"
  and r20: "d1_close & d2_review & limits ==> recommendation"
  and r21: "d1_close & d2_close & limits ==> recommendation"
  and r22: "d1_close & d2_wait & limits ==> recommendation"
  and r23: "d1_wait & d2_review & limits ==> recommendation"
  and r24: "d1_wait & d2_close & limits ==> recommendation"
  and r25: "d1_wait & d2_wait & limits ==> recommendation"
  and r26: "changed_case ==> changed_decision"
  and r27: "changed_case & boundary_rule ==> changed_boundary"
begin end end

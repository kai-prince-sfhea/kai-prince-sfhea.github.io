// Presentation only: keep the generator's integer affordability units unchanged.
export function moneyBudget(journey){return journey?.task_config?.task==='investigation';}
export function formatBudget(journey,amount){
 if(!Number.isSafeInteger(amount)||amount<0)return 'Budget unavailable';
 if(moneyBudget(journey))return '£'+(amount*1000).toLocaleString('en-GB');
 const unit=journey?.budget_unit||'credits';
 return amount+' '+(amount===1&&unit==='hours'?'hour':amount===1&&unit==='credits'?'credit':unit);
}
export function budgetExplanation(journey){return moneyBudget(journey)?'These are fictional GBP costs: each internal budget unit represents £1,000, not a real quotation.':journey?.budget_unit==='hours'?'My budget is preparation time between stages.':'My budget is evidence credits for this exercise.';}

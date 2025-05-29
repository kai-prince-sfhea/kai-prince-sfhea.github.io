// MathJax and LaTeX configuration for the math notes
// Fetch the math metadata and process it to create MathJax and LaTeX macros
const jsonArray = $.getJSON("/papers/math_metadata.json", function(json) {console.log(json);});

// Create a MathJax macros object from the JSON array
const MathJaxmacros = jsonArray.reduce((acc, item) =>
{
    if (item.macro && item.macro_command)
    {acc[item.macro_command] = JSON.parse(item.macro.replaceAll('\\','\\\\').replaceAll("'",'"'));}
    return acc;
},
{});
console.log(MathJaxmacros);

// Save the MathJax macros to a JSON file
var MathJaxMacrosFile = JSON.stringify(MathJaxmacros);
fs.writeFileSync('./MathjaxMacros.json', MathJaxMacrosFile, function(err, result)
{
    if(err) console.log('error', err);
});

// Create a LaTeX macros string from the JSON array
const LaTeXmacros = jsonArray.reduce((acc, item) =>
{
    if (item.macro && item.macro_command)
    {
        const newCommand = "\\newcommand{\\";
        const JSONmacro = JSON.parse(item.macro.replaceAll('\\','\\\\').replaceAll("'",'"'));
        if(Array.isArray(JSONmacro))
        {
            var macroArgs = [];
            if(JSONmacro.length = 2)
            {
                macroArgs = [JSONmacro[1]];
            }
            else if(Array.isArray(JSONmacro[2]))
            {
                macroArgs = JSONmacro[2].unshift(JSONmacro[1]);
            }
            else
            {
                macroArgs = [JSONmacro[1], JSONmacro[2]];
            };
            acc = acc.concat(newCommand,item.macro_command, '}[', macroArgs.join(']['), ']{', JSONmacro[0], '}\n');
        }
        else
        {
            acc.concat(newCommand,item.macro_command, '}{', JSONmacro, '}\n');
        }
    }
    return acc;
},
"");
console.log(LaTeXmacros);

// Save the LaTeX macros to a .tex file
fs.writeFileSync('./papers/LaTeXMacros.tex', LaTeXmacros, function(err, result)
{
    if(err) console.log('error', err);
});
import json

# MathJax and LaTeX configuration for the math notes
# Fetch the math metadata and process it to create MathJax and LaTeX macros
response = open("./papers/math_metadata.json")
json_array = json.load(response)

# Create a MathJax macros object from the JSON array
MathJaxmacros = {}
for item in json_array:
    if 'macro' in item and 'macro_command' in item:
        MathJaxmacros[item['macro_command']] = json.loads(item['macro'].replace("\\", "\\\\").replace("'", '"'))
print(MathJaxmacros)

# Save the MathJax macros to a JSON file
MathJaxMacrosFile = json.dumps(MathJaxmacros)
with open('./MathjaxMacros.json', 'w') as f:
    f.write(MathJaxMacrosFile)

# Create a LaTeX macros string from the JSON array
LaTeXmacros = ""
for item in json_array:
    if 'macro' in item and 'macro_command' in item:
        new_command = "\\newcommand{\\"
        JSONmacro = json.loads(item['macro'].replace('\\', '\\\\').replace("'", '"'))
        if isinstance(JSONmacro, list):
            macro_args = []
            if len(JSONmacro) == 2:
                macro_args = list(str(JSONmacro[1]))
            elif isinstance(JSONmacro[2], list):
                macro_args = list(str(JSONmacro[1])) + json.loads(JSONmacro[2])
            else:
                macro_args = list((str(JSONmacro[1]),JSONmacro[2]))
            LaTeXmacros += new_command + item['macro_command'] + "}[" + "][".join(macro_args) + "]{" + JSONmacro[0] + "}\n"
        else:
            LaTeXmacros += new_command + item['macro_command'] + "}{" + JSONmacro + "}\n"
print(LaTeXmacros)

# Save the LaTeX macros to a .tex file
with open('./papers/LaTeXMacros.tex', 'w') as f:
    f.write(LaTeXmacros)


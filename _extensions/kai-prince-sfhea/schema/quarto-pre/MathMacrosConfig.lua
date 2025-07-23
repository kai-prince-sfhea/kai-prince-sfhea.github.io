-- Load Project Directories
local InputDir = pandoc.system.get_working_directory() or error("Working directory not set")

local MathDir = pandoc.path.join({InputDir, "_maths"})
ok, err, code = os.rename(MathDir.."/", MathDir.."/")
if not ok then
    pandoc.system.make_directory(MathDir, true)
end

-- Create Math Directory file
Directories = {}
Directories[os.getenv("QUARTO_PROJECT_OUTPUT_DIR")] = false
io.open(pandoc.path.join({MathDir,"Render-Directories.json"}),"w"):write(pandoc.json.encode(Directories))

-- Set Output File Directories
local OutputMathJaxFile = pandoc.path.join({MathDir, "Mathjax-macros.json"})
local OutputLaTexFile = pandoc.path.join({MathDir, "Tex-macros.tex"})
local OutputNotationFile = pandoc.path.join({MathDir, "Notation.json"})

-- Load Input Files as List
local InputFiles = os.getenv("QUARTO_PROJECT_INPUT_FILES") or error("QUARTO_PROJECT_INPUT_FILES not set")
local Files = {}
for file in InputFiles:gmatch("[^\r\n]+") do
    table.insert(Files, file)
end

-- Initialise Output Variables
local MathJaxJSON = {}
MathJaxFile = io.open(OutputMathJaxFile, "r")
if MathJaxFile ~= nil then
    MathJaxJSON = pandoc.json.decode(MathJaxFile:read("a"))
end
local notationJSON = {}
NotationFile = io.open(OutputNotationFile, "r")
if NotationFile ~= nil then
    notationJSON = pandoc.json.decode(NotationFile:read("a"))
end


local LaTeXFile = io.open(OutputLaTexFile, "r")
local LaTeXJSON = {}
local LaTeXKeys = {}
if LaTeXFile ~= nil then
    for k, v in string.gmatch(LaTeXFile:read("a"),"(\\newcommand{\\[^}]*})([^\n]*)") do
        LaTeXJSON[k] = v
        LaTeXKeys[k] = k
    end
end
local LaTeX = ""

-- Load each Input File
for _, file in ipairs(Files) do
    ---@type pandoc.List
    ---@class metadata
    ---@field macros table|nil
    local metadata = pandoc.read(io.open(file, "r"):read("*a"), "markdown").meta

    -- Pass each Math Macro
    if type(metadata.macros) == "table" then
        for _, value in ipairs(metadata.macros) do
            -- Load variables
            local cmd = pandoc.utils.stringify(value.command)
            local macro = pandoc.utils.stringify(value.macro)
            local TexCmd = "\\newcommand{\\" .. cmd .. "}"
            LaTeXKeys[TexCmd] = TexCmd
            local variables
            local variablesDefaultString = ""
            local variablesDefaultArray = {}

            -- Map Math Macro to variables
            if value.variables ~= nil then
                variables = pandoc.utils.stringify(value.variables)
                if value.variablesDefault ~= nil then
                    if type(value.variablesDefault) == "table" and value.variablesDefault[2] ~= nil then
                        for _, string in ipairs(value.variablesDefault) do
                            table.insert(variablesDefaultArray, pandoc.utils.stringify(string))
                        end
                        MathJaxJSON[cmd] = {
                            macro,
                            tonumber(variables),
                            variablesDefaultArray
                        }
                        LaTeXJSON[TexCmd] = "[" .. variables .. "]" .. pandoc.utils.stringify(variablesDefaultArray) .. "{" .. macro .. "}"
                    else
                        variablesDefaultString = pandoc.utils.stringify(value.variablesDefault)
                        MathJaxJSON[cmd] = {
                            macro,
                            tonumber(variables),
                            variablesDefaultString
                        }
                        LaTeXJSON[TexCmd] = "[" .. variables .. "][" .. variablesDefaultString .. "]{" .. macro .. "}"
                    end
                else
                    MathJaxJSON[cmd] = {
                        macro,
                        tonumber(variables)
                    }
                    LaTeXJSON[TexCmd] = "[" .. variables .. "]{" .. macro .. "}"
                end
            else
                MathJaxJSON[cmd] = macro
                LaTeXJSON[TexCmd] = "{" .. macro .. "}"
            end
            if value.description ~= nil then
                notationJSON["\\" .. cmd] = pandoc.utils.stringify(value.description)
            end
        end
    end
end

-- Unique Sort
local LaTeXKeys2 = {}
for _, key in pairs(LaTeXKeys) do
    table.insert(LaTeXKeys2,key)
end
table.sort(LaTeXKeys2)

-- Sorted Arrays to LaTeX string
for _, key in ipairs(LaTeXKeys2) do
    line = key..LaTeXJSON[key]
    LaTeX = LaTeX .. line .. "\n"
end

-- Convert MathJax Output to indented JSON + Save to File
MathJaxJSONEncoding = pandoc.json.encode(MathJaxJSON):gsub(",",", "):gsub(":",": ")
MathJaxJSONEncoding2 = string.gsub(string.gsub(MathJaxJSONEncoding,"\", \"","\",\n  \""),"], \"","],\n  \"")
MathJaxJSONEncoding3 = "{\n  " .. MathJaxJSONEncoding2:match "^{(.*)}$" .. "\n}"
io.open(OutputMathJaxFile, "w"):write(MathJaxJSONEncoding3)
print(MathJaxJSONEncoding3)

-- Save Tex commands to File
io.open(OutputLaTexFile, "w"):write(LaTeX)
print(LaTeX)

-- Save Notation Descriptions to File
notationJSONEncoding = pandoc.json.encode(notationJSON):gsub("\",","\",\n  "):gsub(":",": ")
notationJSONEncoding2 = "{\n  " .. notationJSONEncoding:match "^{(.*)}$" .. "\n}"
io.open(OutputNotationFile, "w"):write(notationJSONEncoding2)
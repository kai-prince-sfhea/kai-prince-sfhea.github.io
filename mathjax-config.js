// MathJax configuration for the math notes
// This configuration is used to load MathJax and set up the necessary macros and options
window.MathJax = {
    startup: {
        ready: () => {
            console.log('MathJax is loaded!');
            const metadata = require('./papers/maths_notes/math_metadata.json');
            
            JSON.parse(/papers/maths_notes/math_metadata.json);
            MathJax.startup.defaultReady();
            console.log('MathJax is ready!');
            
        }
    },
    menuOptions: {
        annotationTypes: {
            TeX: ['TeX', 'LaTeX', 'application/x-tex'],
            ContentMathML: ['MathML-Content', 'application/mathml-content+xml'],
            OpenMath: ['OpenMath']
        }
    },
    loader: {load: ['[tex]/texhtml','[tex]/html']},
    tex: {
        allowTexHTML: true,
        packages: {'[+]': ['texhtml','html']},
        macros: {
            R: '{\\mathbb{R}}',
            N: '{\\mathbb{N}}',
            bor: ['{\\style{mathvariant:Borel sigma algebra}{\\text{Bor}}(#1)}',1],
            Group: '{\\Gamma}',
            GroupElement: '{\\gamma}',
            Folner: ['{\\href{/papers/maths_notes/folner.html}{\\Phi}}_{#1}',1,'']
        }
    }
};
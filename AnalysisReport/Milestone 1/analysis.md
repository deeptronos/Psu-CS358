## CS358 Principles of Programming Languages -- Winter 2025
## Language Analysis Report Instructions and Template (v1)
## Due at NOON, Feb. 12, 2025

### Version history:
v1: 2/2/25 Initial release with Report Milestone1 instructions

### Purpose

The goal of the analysis report assignment is to give you experience
in systematically mastering the key features of a new programming 
language.

### Language Selection 

For this report, you must select one of the following languages to study:

- Java
- TypeScript
- Go
- Haskell
- Scala
- Rust

You may choose a language not on this list, but only with prior approval of 
the instructor and TA. (C++ and Python are _not_ allowed!)

You will learn most by picking a language that you don't already know well.

Once you have chosen a language, you must use it for both this initial 
Milestone and for the final version (due in exam week).

### Contents of the report

The report must describe various aspects of your chosen language by answering
the __list of questions__ that appears below. 

To develop your answers, you will need to do some research.  The web should
be sufficient, although there may be useful books whose contents are not
readily available online. Try to use the most authoritative sources you can,
such as official language reference manuals. (One of the questions asks 
about this.) 

Be wary of the results produced by random Googling: sites like Wikipedia 
and StackOverflow are fairly reliable, but many self-published tutorials 
are not. Also be careful if you choose to use a tool like ChatGPT or Google
Search AI; although these tools can be very helpful, they can also get things
quite wrong.

You (almost certainly) will want to do some programming in the language
as well. If you don't want to install a language implementation, you may
find web sites like [tio](https://tio.run) to be useful. Make sure the
language version you run matches the language version you're reporting on.

You don't need to include explicit citations to information sources in your
report, but __if we ask, you should be able to justify any of your answers
by referring to an authoritative source and/or the results of a test 
program.__ ("ChatGPT said so" is not a valid justification!)

The questions asked below mostly concern language aspects that we have
studied in class and/or in the practice exercises. The final version of your
Report will need to address a considerably longer list of questions covering
topics we'll meet later in the course. 

### Format of the report

You should write your report by making a copy of this file called `report.md`
and filling in answers to the __questions that appear below__.  In other 
words, this Markdown (`.md`) file itself is a template for the report. 

The main reason for using Markdown is that it makes it very easy to include
nicely-displayed code fragments (or screen shots) in the text to illustrate
your answers. In particular, a multiline program fragment is delimited by
three backticks, e.g.:
```
int main(int x) {
    return x + 1;
}
```
and an inline code fragment by single backticks, e.g. `main`. Here are
[more details](https://commonmark.org/) on how to use Markdown. 

Please make sure that your report is properly formatted before you submit.
We strongly recommend using something like the interactive 
[Markdown previewer in VSCode](https://code.visualstudio.com/docs/languages/markdown#_markdown-preview)
to check the appearance of your file as you write it.

### Style of the report

You should interpret questions as an opportunity to explain the relevant
aspects of the language fully. (Even if a question could just be answered
"yes" or "no" you should include an explanation or example.)

Use code fragments generously to illustrate your answers wherever 
appropriate.  It may help to think of yourself as writing a blogpost,
guiding your reader through the technical details of your answers. Be clear, 
precise, and concise.  Your writing can be informal, but please make sure it
is grammatically correct and free of spelling errors. 

You should assume that your reader has knowledge of C++ and Python, so you
can make comparisons to these languages without further explanation if this
seems useful. 

### Submission

To submit, upload just your `report.md` file to Canvas by Noon, Feb. 12, 2025.

### Scoring 

Your delivered `report.md` will be scored according to a point-based rubric. 
Points will be distributed roughly evenly over the questions.  Unlike the
weekly practice exercises, you will only get points for (reasonably) correct
answers, i.e., no points just for effort.

Content is more important than form, but you will lose some points if your
text is poorly organized, incoherent, rambling, or otherwise difficult to
understand. 

You will be given the opportunity to fix any problems as part of your final
submission, and by doing this you can potentially get back up to 50% of any
points you lose in Milestone 1. 

---

### Questions to answer

Using this file as a template, fill in your answers below. 

#### Basic information 

- What is your chosen language?

- What range of applications/programming tasks is this language intended for? 

- What (if any) distinctive features does the language have that
differentiate it from other languages? (What does the language documentation
brag about?)

- Who originally invented the language, and when?

- What are the main implementations of the language available today,
and who maintains them?

- Which exact implementation/version of the language are you reporting
on here?

- What authoritative documentation (reference manuals, etc.) is available
for the language/implementation?

- Is the language officially standardized by some industry group or 
government organization? If so, include a pointer to the relevant standards
document.

- Is the language typically compiled or interpreted? What about the
implementation you are reporting on here?  If the implementation includes
multiple stages (e.g. compilation to an intermediate code that is interpreted),
describe this. 

- Is there an official formal grammar (e.g. in BNF) for the language? 
If so, include a pointer to this if possible.

#### Primitive types and expressions

- Does the language use static or dynamic typing?

- What kinds of primitive numeric types are supported (integers, floats, etc.)?  What are their ranges and precisions?

- What happens if integer operations overflow?  What happens on division
by zero?

- How are booleans represented? Are booleans distinct from integers?
What values are considered "truthy" and "falsy" in conditional tests?

- How are strings represented?  How are basic string operations (substring,
concatenation, etc.) performed?

- What operators are allowed in expressions? What are any interesting
features of the precedence and associativity rules for operators (e.g.,
differences from other languages like C++ or Python)? 

- Is there an equivalent to `let` bindings in expressions?

#### Functions, binding, scoping

- What is the syntax for function definitions?  What about for mutually
recursive function definitions? 

- Can function definitions be nested (i.e. can we define a local function
within the body of another function)? If so, what is the syntax for this?

- Are there any unusual features to the binding and scoping rules (e.g.
like Python's `global` and `nonlocal` declarations)?

- Can functions be passed as arguments to other functions (e.g. passing
a comparison operator to a general-purpose `sort` function)?

- Can functions be stored in data structures (e.g. when serving as a
call-back)?

- Is there support for anonymous functions (lambda expressions)? If so,
what is the syntax for them? Are there restrictions on the form of
anonymous function bodies? 

- Does the language use static or dynamic binding (in the sense discussed
in class)? 

- How are arguments passed to functions (e.g., by value, by name,
something else)?







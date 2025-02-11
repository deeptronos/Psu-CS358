# Analysis Report Milestone 1
## Catherine Nemec 2025
### Questions to answer

Using this file as a template, fill in your answers below. 

#### Basic information 

- What is your chosen language?

    I've chosen Rust as my programming language. I have a little bit of experience with it, but not enough to be confident in the language. I find it very interesting and would like to ultimately use it a lot more in place of older languages that try to accomplish the same goals (C++, etc.)

- What range of applications/programming tasks is this language intended for? 

    From what I understand, Rust is not specifically specialized for any particular domains. It seems to be more general-purpose, like a language like C++ or Python, but with different priorities in the fundamentals of the language design.

- What (if any) distinctive features does the language have that
differentiate it from other languages? (What does the language documentation
brag about?)

    Enforcement of memory safety while a program runs is accomplished using the "borrow checker" rather than a traditional garbage collector, like Python does to accomplish the same task. Thus, Rust programs can theoretically approach the compiled speed of the most performant languages while being confident that memory is safe by the time a Rust program has been compiled.

- Who originally invented the language, and when?

    The language was invented by Grayden Hoare, a software developer, who began the project while a Mozilla researcher in 2006.

- What are the main implementations of the language available today,
and who maintains them?

    There is only one main, native compiler for the Rust language, called `rustc`, and it's maintained and provided by the Rust project (i.e. its developers and community) itself.

- Which exact implementation/version of the language are you reporting
on here?

    I'm reporting on the latest stable version provided by the Rust foundation, V 1.84.1.

- What authoritative documentation (reference manuals, etc.) is available
for the language/implementation?

    Rust directs beginners to start with a few types of onboarding material - the most authoratative of which would be *The Rust Programming Language*, which is a guided overview of the language from its first principles. There are a plethora of other, similarly-free/open-source texts that the commmunity writes and maintains for more specific corners of the languages (such as Rust on embedded devices), so they seem to be high-quality materials. 
    For more experienced developers, Rust provides *The Rust Reference*, another open-source book that is consistenly maintained as a central knowledge resource.

- Is the language officially standardized by some industry group or 
government organization? If so, include a pointer to the relevant standards
document.

    From what I understand, no, Rust does not have official standards. This is based on my reading of [this article](https://blog.m-ou.se/rust-standard/) by Rust team member Mara Bos, which gave a lot of insight into the behind-the-scene of Rust's organization. It seems like the more modern inception of Rust has lead development efforts to make different organizational decisions than languages like C++ were able to at this point in its existence. The article cites the normalization of open-source development and the tools we now use for digital communication as the main differentiators from C++.

- Is the language typically compiled or interpreted? What about the
implementation you are reporting on here?  If the implementation includes
multiple stages (e.g. compilation to an intermediate code that is interpreted),
describe this. 

    Rust is a compiled language, and it uses the Rust compiler (`rustc`) to produce machine code. The compilation process involves parsing, generating MIR, optimizing, translating to LLVM IR, and linking.

- Is there an official formal grammar (e.g. in BNF) for the language? 
If so, include a pointer to this if possible.

    Yes, Rust's *The Rust Reference* book defines the grammer used during compilation here: https://doc.rust-lang.org/reference/notation.html?highlight=grammar#grammar

#### Primitive types and expressions

- Does the language use static or dynamic typing?

    Rust uses static typing, which helps enforce the Rust compiler's promises.

- What kinds of primitive numeric types are supported (integers, floats, etc.)?  What are their ranges and precisions?

    The Rust Reference documents Rust's numeric types here: https://doc.rust-lang.org/stable/reference/types/numeric.html
    Rust provides integers and floats. According to the reference, there are two tyes of integers (signed and unsigned). All unsigned integers begin at 0 and have a maximum corresponding to two to the power of the number of bits used in their representation minus one, whereas signed integers have a minimum of negative 2 to the number of bits minues one and a maximum of (2 to the number of bits minus one) minus one. The reference indicates that the ranges and precisions of the two standard float types, `f32` and `f64`, correspond to the IEEE 754-2008 "binary32" and "binary64" floating-point types.

- What happens if integer operations overflow?  What happens on division
by zero?

    I used the following to test integer overflow:
    ```Rust
    fn main() {
        let mut a = u8::MIN;
        loop {
            println!("a: {}", a);
            a = a + 1;
        }
    }
    ```
    which, when run, printed 0-255 before panicking and exiting with status 101 and the message "attempted to add with overflow".

    I used the following to test divide-by-zero: 
    ```Rust
    fn main() {
        let a = u8::MIN; // u8::MIN == 0
        let b = 10;
        let c = b / a;
        println!("c: {}", c);
    }
    ```
    which is not even allowed to compile - instead, catches the DBZ and throws an error before any code is put together. Here's the error: `error: this operation will panic at runtime`.


- How are booleans represented? Are booleans distinct from integers?
What values are considered "truthy" and "falsy" in conditional tests?

    Rust's boolean primitive is a distinct type from integers. It has a concise representation in memory (a size and alignment of 1, each, where the value `0x00` means false and `0x01` means true, and a boolean having anything else is undefined behavior.) True is considered "truthy" and false is considered "falsy".

- How are strings represented?  How are basic string operations (substring,
concatenation, etc.) performed?

    In Rust, a `String` is used to represent dynamic string types (like a `Vec` in C++) whereas the `str` type is an immutable byte-sequence of dynamic length stored somewhere in memory. This type must be handled via a pointer, and so `String`s are used for passing around textual data while `str`s simply let you "view" a string. However, Rust 's STL can interpret a `str` the same way a `u8` array is represented, except that it assumes that each entry in the array representing the `str` is valid UTF-8. So, `str` is more of a primitive while `String` is often more ergonomic to work with.
    Rust performs these operations by working directly with data known to be UTF-8 thanks to the types Rust supplies.

- What operators are allowed in expressions? What are any interesting
features of the precedence and associativity rules for operators (e.g.,
differences from other languages like C++ or Python)? 

    The operators allowed to be used on types are defined by the types themselves, and most can be overloaded by the programmer as needed. The evaluation/precedence/associativity rules vary depending on the types of the operands: with primitive types the right-hand side always gets evaluated first, while non-primitive types will cause the left-hand side to be evaluated first.

- Is there an equivalent to `let` bindings in expressions?

    Yes, Rust provides `let` bindings. They are used to bind values to variables.

#### Functions, binding, scoping

- What is the syntax for function definitions?  What about for mutually
recursive function definitions? 

    In Rust, functions are defined with the `fn` keyword followed by an identifier, generic parameters, function parameters enclosed in parentheses, a function return type, a "where" clause", and finally by the function's body as some sort of block expressions. The syntax defining mutually-recursive functions is perfectly acceptable.

- Can function definitions be nested (i.e. can we define a local function
within the body of another function)? If so, what is the syntax for this?

    Rust allows you to define functions within other functions very intuitively, without syntax that differs from normal function definition (aside from the context.)

- Are there any unusual features to the binding and scoping rules (e.g.
like Python's `global` and `nonlocal` declarations)?

    One of Rust's most infamous unique aspects is the way variables are managed according to its borrow-checker's rules, which is an aspect of the compilation process that enforces safety.  Rust uses lexical scoping, allows shadowing, supplies immutable variables by default, and enforces unique ownership rules that ensure safety within the confines of these binding/scoping rules.

- Can functions be passed as arguments to other functions (e.g. passing
a comparison operator to a general-purpose `sort` function)?

    Yes, this is supported by Rust. There are several ways to acheive this, each with different characteristics. Straightforwardly, Rust supplies function pointers, which may be familiar from C++. In addition, Rust provides closures (anonymous functions that capture variables from the surrounding context) that are defined by using Rust closure traits and potentially including `dyn Trait`s to work with different types of closures.

- Can functions be stored in data structures (e.g. when serving as a
call-back)?

    Yes. This can be performed using function pointers or trait objects, as above, but Rust also supports the `move` keyword, which can be used with closures that need ownership of their captured variables but may need to persist beyond the scope of the original variables.

- Is there support for anonymous functions (lambda expressions)? If so,
what is the syntax for them? Are there restrictions on the form of
anonymous function bodies? 

    Yes. Closures are the form that anonymous functions take in Rust, which enforce rules about the value they `return` as well as the variables captured from the surrounding environment.

- Does the language use static or dynamic binding (in the sense discussed
in class)? 

    Rust uses static typing. This follows from the way the compiler enforces Rust's safety promises.

- How are arguments passed to functions (e.g., by value, by name,
something else)?

    Rust could be considered a "pass-by-value" language, but it's more nuanced than that. For types that are `Copy`, traditional pass-by-value behavior occurs. For non-`Copy` types, ownership is moved (which is still pass-by-value but has more consequences to misuse.) Borrowing is the mechanism Rust supplies to avoid transfers of ownership during function calls, and essentially act like references.







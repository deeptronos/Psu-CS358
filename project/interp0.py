# A simple interpreter for arithmetic expressions with let bindings

from dataclasses import dataclass

# We represent expressions as trees. 
# Each class of Expr represents a different kind of operator, with its operands.
type Expr = Add | Sub | Mul | Neg | Lit | Let | Name    # union type

# Each binary operator has two operands, left and right
@dataclass
class Add():
    left: Expr
    right: Expr
    def __str__(self) -> str:
        return f"({self.left} + {self.right})"

@dataclass
class Sub():
    left: Expr
    right: Expr
    def __str__(self) -> str:
        return f"({self.left} - {self.right})"

@dataclass
class Mul():
    left: Expr
    right: Expr
    def __str__(self) -> str:
        return f"({self.left} * {self.right})"

# The unary operator Neg has a single operand
@dataclass
class Neg():
    subexpr: Expr
    def __str__(self) -> str:
        return f"(- {self.subexpr})"

# Literals are just integers
@dataclass
class Lit():
    value: int
    def __str__(self) -> str:
        return f"{self.value}"

# Let bindings have a name, a definition expression, and a body expression
@dataclass
class Let():
    name: str
    defexpr: Expr
    bodyexpr: Expr
    def __str__(self) -> str:
        return f"(let {self.name} = {self.defexpr} in {self.bodyexpr})"

# Names are just strings referencing a let binding
@dataclass
class Name():
    name:str
    def __str__(self) -> str:
        return self.name

a : Expr = Let('x', Add(Lit(1), Lit(2)), 
                    Sub(Name('x'), Lit(3)))
print(a)

b : Expr = Let('x', Lit(1), 
                    Let('x', Lit(2), 
                             Mul(Name('x'), Lit(3))))
print(b)  

c : Expr = Add(Let('x', Lit(1), 
                        Sub(Name('x'), Lit(2))),
               Mul(Name('x'), Lit(3)))
print(c)

# To interpret let bindings and names, we need environments.
# We represent environments as lists of bindings, where each binding is a pair of a name and a value.
# Environments are immutable.

type Binding[V] = tuple[str,V]  # this tuple type is always a pair
type Env[V] = tuple[Binding[V], ...] # this tuple type has arbitrary length 

# The empty environment is just the empty tuple
from typing import Any
emptyEnv : Env[Any] = ()  

# We only produce new environments by extending existing ones with new bindings.
def extendEnv[V](name: str, value: V, env:Env[V]) -> Env[V]:
    '''Return a new environment that extends the input environment env with a new binding from name to value'''
    return ((name,value),) + env

# We always look up names in an environemnt using the following function.
def lookupEnv[V](name: str, env: Env[V]) -> (V | None) :
    '''Return the first value bound to name in the input environment env
       (or raise an exception if there is no such binding)'''
        # exercises2b.py shows a different type signature and implementation alternative
    match env:
        case ((n,v), *rest) :
            if n == name:
                return v
            else:
                return lookupEnv(name, rest) # type:ignore
        case _ :
            return None        
        
# Evaluation produces an integer result, or raises a polite exception if a name is unbound.
class EvalError(Exception):
    pass

# The top-level evaluation function just calls the recursive evaluation function with an empty environment.
def eval(e: Expr) -> int :
    return evalInEnv(emptyEnv, e)

# Evaluation takes place in an environment, which is threaded through the recursive calls.
def evalInEnv(env: Env[int], e:Expr) -> int:
    match e:
        case Add(l,r):
            return evalInEnv(env,l) + evalInEnv(env,r)
        case Sub(l,r):
            return evalInEnv(env,l) - evalInEnv(env,r)
        case Mul(l,r): # we can fix the evaluation order or l and r more explicitly if we care
            lv = evalInEnv(env,l)
            rv = evalInEnv(env,r)
            return lv * rv
        case Neg(s):
            return - (evalInEnv(env,s))
        case Lit(i):
            return i
        case Name(n):
            v = lookupEnv(n, env)
            if v is None:
                raise EvalError(f"unbound name {n}")
            return v
        case Let(n,d,b):
            v = evalInEnv(env, d)
            newEnv = extendEnv(n, v, env)
            return evalInEnv(newEnv, b)
        
# A top-level harness to run some examples
def run(e: Expr) -> None:
    print(f"running: {e}")
    try:
        i = eval(e)
        print(f"result: {i}")
    except EvalError as err:
        print(err)

run(a)
run(b)
run(c)

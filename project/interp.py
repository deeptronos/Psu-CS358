# # External dependencies:
# # MIDIUtil-1.2.1

from dataclasses import dataclass
from enum import Enum
from typing import Union # Used for allowing multiple data types in a dataclass

# Define primitive melody literals
class Frequency(Enum):
    C = 0
    D = 1
    E = 2
    F = 3
    G = 4
    A = 5
    B = 6

type Note =  Pitch | Rest

@dataclass
class Pitch():
    frequency: Frequency
    octave: int # TODO bound...
    duration: float
    def __str__(self) -> str:
        return f"Pitch({self.frequency}, {self.octave}, {self.duration})"

@dataclass
class Rest():
    duration: float
    def __str___(self) -> str:
        return f"Rest({self.duration})"


@dataclass
class Tune:
    t: tuple[Note, ...]

type Value = Tune | int | bool # The return type for Eval

# Arithmetic boolean, binding/variables, equality comparison, relational comparison, conditional
type Expr = Add | Sub | Mul | Div | Neg | Lit | Let | Name | Or | And | Not | Eq | Lt | If | ConcatTune | TransposeTune # TODO appropriate inclusion of domain specific additions to Expr?

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

@dataclass
class Div():
    left: Expr
    right: Expr
    def __str__(self) -> str:
        return f"({self.left} / {self.right})"

@dataclass
class Neg():
    subexpr: Expr
    def __str__(self) -> str:
        return f"(- {self.subexpr})"

# @dataclass
# class Lit():
#     value: int
#     def __str__(self) -> str:
#         return f"{self.value}"
    
# @dataclass
# class Lit():
#     value: bool
#     def __str__(self) -> str:
#         return f"{self.value}"

@dataclass
class Lit():
    value: Union[int, bool]
    def __str__(self) -> str:
        return f"{self.value}"

@dataclass
class Let():
    name: str
    defexpr: Expr
    bodyexpr: Expr
    def __str__(self) -> str:
        return f"(let {self.name} = {self.defexpr} in {self.bodyexpr})"

@dataclass
class Name():
    name:str
    def __str__(self) -> str:
        return self.name

@dataclass
class Or():
    left: Expr
    right: Expr
    def __str__(self) -> str:
        return f"({self.left} or {self.right})"

@dataclass
class And():
    left: Expr
    right: Expr
    def __str__(self) -> str:
        return f"({self.left} and {self.right})"

@dataclass
class Not():
    subexpr: Expr
    def __str__(self) -> str:
        return f"(not {self.subexpr})"

@dataclass
class Eq():
    left: Expr
    right: Expr
    def __str__(self) -> str:
        return f"({self.left} == {self.right})"

@dataclass
class Lt():
    left: int
    right: int
    def __str__(self) -> str:
        return f"({self.left} < {self.right})"

@dataclass
class If():
    bool_operand : bool
    then_operand: Expr
    else_operand: Expr
    def __str__(self) -> str:
        return f"(if {self.bool_operand} then {self.then_operand} else {self.else_operand})"

@dataclass 
class ConcatTune():
    left: Tune
    right: Tune
    def __str__(self) -> str:
        return f"(Concatenate {self.left} with {self.right})"

@dataclass
class TransposeTune:
    left: Tune
    right: int # Number of half-steps
    def __str__(self) -> str:
        return f"(Transpose {self.left} by {self.right} half-steps)"



# To interpret let bindings and names, we need environments.
# We represent environments as lists of bindings, where each binding is a pair of a name and a value.
# Environments are immutable.

type Binding[V] = tuple[str,V]  # this tuple type is always a pair
type Env[V] = tuple[Binding[V], ...] # this tuple type has arbitrary length 

from typing import Any
emptyEnv : Env[Any] = ()  # the empty environment has no bindings

def extendEnv[V](name: str, value: V, env:Env[V]) -> Env[V]:
    '''Return a new environment that extends the input environment env with a new binding from name to value'''
    return ((name,value),) + env

def lookupEnv[V](name: str, env: Env[V]) -> (V | None) :
    '''Return the first value bound to name in the input environment env
       (or raise an exception if there is no such binding)'''
    # exercises2b.py shows a different implementation alternative
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
def eval(e: Expr) -> Value :
    return evalInEnv(emptyEnv, e)


# Evaluation takes place in an environment, which is threaded through the recursive calls.
def evalInEnv(env: Env[int], e:Expr) -> int:
    match e:
        case Add(l,r):
            match(evalInEnv(env, l), evalInEnv(env, r)):
                case(int(lv), int(rv)):
                    return lv + rv
                case _:
                    raise EvalError("addition of non-integers")
        case Sub(l,r):
             match(evalInEnv(env, l), evalInEnv(env, r)):
                case(int(lv), int(rv)):
                    return lv - rv
                case _:
                    raise EvalError("subtraction of non-integers")
        case Mul(l,r): # we can fix the evaluation order or l and r more explicitly if we care
            match (evalInEnv(env,l), evalInEnv(env,r)):
                case (int(lv), int(rv)):
                    return lv * rv
                case _:
                    raise EvalError("multiplication of non-integers")
        case Neg(s):
            match evalInEnv(env,s):
                case int(i):
                    return -i
                case _:
                    raise EvalError("negation of non-integer")
        case(Lit(lit)):
            match lit:  # two-level matching keeps type-checker happy
                case int(i):
                    return i
                case bool(i):
                    return i
                case Note(_) as a:
                    return Tune((a,))
          
        case Name(n):
            v = lookupEnv(n, env)
            if v is None:
                raise EvalError(f"unbound name {n}")
            return v
        case Let(n,d,b):
            v = evalInEnv(env, d)
            newEnv = extendEnv(n, v, env)
            return evalInEnv(newEnv, b)

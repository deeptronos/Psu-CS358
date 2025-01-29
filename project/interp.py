# # External dependencies:
# # MIDIUtil-1.2.1

# TODO: AST Frequencies to midi note # conversion?

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

type Value = Tune | Note | Rest | int | bool # The return type for Eval

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

@dataclass
class TransposeNote:
    left: Note
    right: int # Number of half-steps
    def __str__(self) -> str:
        return f"(Transpose (NOTE) {self.left} by {self.right} half-steps)"



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
def evalInEnv(env: Env[int], e:Expr) -> Value:
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
                case Tune(i):
                    return Tune(i)
                case Pitch(_) as p:
                    return p
                case Rest(_) as r:
                    return r
                case Frequency(_) as f:
                    return f
                # case Note(Pitch) as a: # TODO bad idea to return Tunes?
                #     # return Tune((a,))
                #     return a
                # case Note(Rest) as a:
                #     # return Tune((a, ))
                #     return a # TODO is this appropriate?
                # case _:

                
        case Name(n):
            v = lookupEnv(n, env)
            if v is None:
                raise EvalError(f"unbound name {n}")
            return v
        case Let(n,d,b):
            v = evalInEnv(env, d)
            newEnv = extendEnv(n, v, env)
            return evalInEnv(newEnv, b)
        case Or(l, r):
            match(evalInEnv(env, l), evalInEnv(env, r)):
                case(bool(lv), bool(rv)):
                    return lv or rv
                case _:
                    raise EvalError("OR-ing of non-booleans")
        case And(l, r):
            match(evalInEnv(env, l), evalInEnv(env, r)):
                case(bool(lv), bool(rv)):
                    return lv and rv
                case _:
                    raise EvalError("AND-ing of non-booleans")
                
        case Eq(l, r):
            match(evalInEnv(env, l), evalInEnv(env, r)):
                case(bool(lv), bool(rv)):
                    return lv == rv
                case(int(lv), int(rv)):
                    return lv == rv
                case(Tune(lv), Tune(rv)): # Check if tunes are same length,  then iterate thru and check tune Notes at each position. TODO could I pythonically use existing tuple == check??
                    if len(lv.t) == len(rv.t):
                        for i in range(len(lv.t)):
                            if lv.t[i] != rv.t[i]:
                                return False
                        return True
                    else:
                        return False
                # TODO cases for Note/Pitch/Rest?
                case _:
                    raise EvalError("Equality checking with invalid operands")

        case Lt(l, r):
            match(evalInEnv(env, l), evalInEnv(env, r)):
                case(int(lv), int(rv)):
                    return l < r
                case _:
                    raise EvalError("Relational comparison with non-integer operands")

        case If(b, t, e):
            match(evalInEnv(env, b)):
                case(bool(b)):
                    if b is True:
                        return evalInEnv(env, t)
                    else:
                        return evalInEnv(env, e)
                case _:
                    raise EvalError("Conditional operator with non-boolean test value")
                
        case ConcatTune(l, r):
            match(evalInEnv(env, l), evalInEnv(env, r)):
                case(Tune(lv), Tune(rv)):
                    return Tune(lv + rv)
                case _:
                    raise EvalError("ConcatTune operator with non-Tune operands")
                
        case TransposeTune(l, r):
            return Tune(l)
            match(evalInEnv(env, l), evalInEnv(env, r)):
                case(Tune(lv), int(rv)):
                    shifted_notes = []
                    for note in lv:
                        match note:
                            case Pitch():
                                new_octave = note.octave + rv
                                shifted_notes.append(Pitch(note.frequency.value, new_octave, note.duration))
                            case Rest():
                                shifted_notes.append(Rest(note.duration))
                            case _:
                                raise EvalError("Unexpected note type in TransposeTune")
                            
                            #  case(Lit(lit)):
                                # match lit:  # two-level matching keeps type-checker happy
                                    # case int(i):
                        # match note:
                        #     case Pitch(pitch_note):
                        #         new_octave = pitch_note.octave + rv
                        #         shifted_notes.append(Pitch(note.frequency.value, new_octave, note.duration))
                        #     case Rest(rest_note):
                        #         shifted_notes.append(Rest(rest_note.duration))
                        #     case _:
                        #         raise EvalError("Unexpected note type in TransposeTune")
                    return Tune(shifted_notes)
                case _:
                    raise EvalError("TransposeTune on invalid operands")
                
        case TransposeNote(l ,r):
            match(evalInEnv(env, l), evalInEnv(env, r)):
                case(Pitch(lv), int(rv)):
                    return Note(lv)
                case(Rest(lv), int(rv)):
                    return Rest(lv)
                case _:
                    raise EvalError("TransposeNote on invalid operands")

from midiutil import MIDIFile
# TODO organize midi setup
track = 0
channel = 0
time = 0 # in beats
duration = 64 # in beats
tempo = 80 # in BPM
volume = 127 # 0-127



def run(e: Expr) -> None:
    print(f"running {e}\n" )
    try:
        match eval(e):
            case int(i):
                print(f"result: {i}")
            case bool(i):
                print(f"result: {i}")
            case Tune(tune):
                myMidi = MIDIFile(1)
                myMidi.addTempo(track, time, tempo)
                incr = duration / len(tune) # The spacing between each beat given the # of beats and the length of the tune
                timer = 0
                for note in tune:
                    if isinstance(note, Pitch):
                        myMidi.addNote(track, channel, note.frequency.value, timer, note.duration, volume)
                    timer += incr

                print("Opening file for midi write-out...")
                binfile = open("output.mid", 'wb')
                myMidi.writeFile(binfile)
                binfile.close()

                return Tune(tune) #TODO ok?
    except EvalError as err:
        print('\t'+str(err))

a : Tune = Lit(Tune([(Pitch(Frequency.C, 0, 1.0)), (Pitch(Frequency.D, 0, 1.0)), (Pitch(Frequency.E, 0, 1.0)), (Pitch(Frequency.F, 0, 1.0)), (Pitch(Frequency.G, 0, 1.0)), (Pitch(Frequency.A, 0, 1.0)), (Pitch(Frequency.B, 0, 1.0))]))
b : Tune = Lit(Tune([(Pitch(Frequency.C, 1, 1.0)), (Pitch(Frequency.D, 2, 1.0)), (Pitch(Frequency.E, 3, 1.0)), (Pitch(Frequency.F, 4, 1.0)), (Pitch(Frequency.G, 5, 1.0)), (Pitch(Frequency.A, 6, 1.0)), (Pitch(Frequency.B, 7, 1.0))]))
c : Tune = Lit(Tune([(Rest(1)), (Pitch(Frequency.C, 3, 0.5)), (Pitch(Frequency.E, 3, 1.5))]))


d : Tune = ConcatTune(a, b)
e : Tune = ConcatTune(b, a)
f : Tune = ConcatTune(d,a)
g : Tune = ConcatTune(d,e)
h : Tune = ConcatTune(ConcatTune(a, c), ConcatTune(b, c))

i : Tune = Lit(TransposeTune(a, Lit(2)))
j : Tune = Lit(TransposeTune(h, Lit(3)))
k : Tune = Lit(ConcatTune(ConcatTune(c, TransposeTune(c, Lit(1))), ConcatTune(c, TransposeTune(c, Lit(3)))))

run(a)
run(b)
run(c)
run(d)
run(e)
run(f)
run(g)
run(h)
run(i)
run(j)
run(k)

# test_phase1_core demo
expr = Sub(Lit(-90), Lit(True))
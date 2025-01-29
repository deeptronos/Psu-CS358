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



# Arithmetic boolean, binding/variables, equality comparison, relational comparison, conditional
type Expr = Add | Sub | Mul | Div | Neg | Lit | Let | Name | Or | And | Not | Eq | Lt | If | Note # TODO appropriate inclusion of domain specific additions to Expr?

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
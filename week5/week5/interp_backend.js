var main;
(() => {
    var __webpack_modules__ = {
        "./node_modules/moo/moo.js": function(module, exports) {
            var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
            (function(root, factory) {
                if (true) {
                    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = factory, __WEBPACK_AMD_DEFINE_RESULT__ = typeof __WEBPACK_AMD_DEFINE_FACTORY__ === "function" ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))
                } else {}
            })(this, (function() {
                "use strict";
                var hasOwnProperty = Object.prototype.hasOwnProperty;
                var toString = Object.prototype.toString;
                var hasSticky = typeof(new RegExp).sticky === "boolean";

                function isRegExp(o) {
                    return o && toString.call(o) === "[object RegExp]"
                }

                function isObject(o) {
                    return o && typeof o === "object" && !isRegExp(o) && !Array.isArray(o)
                }

                function reEscape(s) {
                    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
                }

                function reGroups(s) {
                    var re = new RegExp("|" + s);
                    return re.exec("").length - 1
                }

                function reCapture(s) {
                    return "(" + s + ")"
                }

                function reUnion(regexps) {
                    if (!regexps.length) return "(?!)";
                    var source = regexps.map((function(s) {
                        return "(?:" + s + ")"
                    })).join("|");
                    return "(?:" + source + ")"
                }

                function regexpOrLiteral(obj) {
                    if (typeof obj === "string") {
                        return "(?:" + reEscape(obj) + ")"
                    } else if (isRegExp(obj)) {
                        if (obj.ignoreCase) throw new Error("RegExp /i flag not allowed");
                        if (obj.global) throw new Error("RegExp /g flag is implied");
                        if (obj.sticky) throw new Error("RegExp /y flag is implied");
                        if (obj.multiline) throw new Error("RegExp /m flag is implied");
                        return obj.source
                    } else {
                        throw new Error("Not a pattern: " + obj)
                    }
                }

                function pad(s, length) {
                    if (s.length > length) {
                        return s
                    }
                    return Array(length - s.length + 1).join(" ") + s
                }

                function lastNLines(string, numLines) {
                    var position = string.length;
                    var lineBreaks = 0;
                    while (true) {
                        var idx = string.lastIndexOf("\n", position - 1);
                        if (idx === -1) {
                            break
                        } else {
                            lineBreaks++
                        }
                        position = idx;
                        if (lineBreaks === numLines) {
                            break
                        }
                        if (position === 0) {
                            break
                        }
                    }
                    var startPosition = lineBreaks < numLines ? 0 : position + 1;
                    return string.substring(startPosition).split("\n")
                }

                function objectToRules(object) {
                    var keys = Object.getOwnPropertyNames(object);
                    var result = [];
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        var thing = object[key];
                        var rules = [].concat(thing);
                        if (key === "include") {
                            for (var j = 0; j < rules.length; j++) {
                                result.push({
                                    include: rules[j]
                                })
                            }
                            continue
                        }
                        var match = [];
                        rules.forEach((function(rule) {
                            if (isObject(rule)) {
                                if (match.length) result.push(ruleOptions(key, match));
                                result.push(ruleOptions(key, rule));
                                match = []
                            } else {
                                match.push(rule)
                            }
                        }));
                        if (match.length) result.push(ruleOptions(key, match))
                    }
                    return result
                }

                function arrayToRules(array) {
                    var result = [];
                    for (var i = 0; i < array.length; i++) {
                        var obj = array[i];
                        if (obj.include) {
                            var include = [].concat(obj.include);
                            for (var j = 0; j < include.length; j++) {
                                result.push({
                                    include: include[j]
                                })
                            }
                            continue
                        }
                        if (!obj.type) {
                            throw new Error("Rule has no type: " + JSON.stringify(obj))
                        }
                        result.push(ruleOptions(obj.type, obj))
                    }
                    return result
                }

                function ruleOptions(type, obj) {
                    if (!isObject(obj)) {
                        obj = {
                            match: obj
                        }
                    }
                    if (obj.include) {
                        throw new Error("Matching rules cannot also include states")
                    }
                    var options = {
                        defaultType: type,
                        lineBreaks: !!obj.error || !!obj.fallback,
                        pop: false,
                        next: null,
                        push: null,
                        error: false,
                        fallback: false,
                        value: null,
                        type: null,
                        shouldThrow: false
                    };
                    for (var key in obj) {
                        if (hasOwnProperty.call(obj, key)) {
                            options[key] = obj[key]
                        }
                    }
                    if (typeof options.type === "string" && type !== options.type) {
                        throw new Error("Type transform cannot be a string (type '" + options.type + "' for token '" + type + "')")
                    }
                    var match = options.match;
                    options.match = Array.isArray(match) ? match : match ? [match] : [];
                    options.match.sort((function(a, b) {
                        return isRegExp(a) && isRegExp(b) ? 0 : isRegExp(b) ? -1 : isRegExp(a) ? +1 : b.length - a.length
                    }));
                    return options
                }

                function toRules(spec) {
                    return Array.isArray(spec) ? arrayToRules(spec) : objectToRules(spec)
                }
                var defaultErrorRule = ruleOptions("error", {
                    lineBreaks: true,
                    shouldThrow: true
                });

                function compileRules(rules, hasStates) {
                    var errorRule = null;
                    var fast = Object.create(null);
                    var fastAllowed = true;
                    var unicodeFlag = null;
                    var groups = [];
                    var parts = [];
                    for (var i = 0; i < rules.length; i++) {
                        if (rules[i].fallback) {
                            fastAllowed = false
                        }
                    }
                    for (var i = 0; i < rules.length; i++) {
                        var options = rules[i];
                        if (options.include) {
                            throw new Error("Inheritance is not allowed in stateless lexers")
                        }
                        if (options.error || options.fallback) {
                            if (errorRule) {
                                if (!options.fallback === !errorRule.fallback) {
                                    throw new Error("Multiple " + (options.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options.defaultType + "')")
                                } else {
                                    throw new Error("fallback and error are mutually exclusive (for token '" + options.defaultType + "')")
                                }
                            }
                            errorRule = options
                        }
                        var match = options.match.slice();
                        if (fastAllowed) {
                            while (match.length && typeof match[0] === "string" && match[0].length === 1) {
                                var word = match.shift();
                                fast[word.charCodeAt(0)] = options
                            }
                        }
                        if (options.pop || options.push || options.next) {
                            if (!hasStates) {
                                throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options.defaultType + "')")
                            }
                            if (options.fallback) {
                                throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options.defaultType + "')")
                            }
                        }
                        if (match.length === 0) {
                            continue
                        }
                        fastAllowed = false;
                        groups.push(options);
                        for (var j = 0; j < match.length; j++) {
                            var obj = match[j];
                            if (!isRegExp(obj)) {
                                continue
                            }
                            if (unicodeFlag === null) {
                                unicodeFlag = obj.unicode
                            } else if (unicodeFlag !== obj.unicode && options.fallback === false) {
                                throw new Error("If one rule is /u then all must be")
                            }
                        }
                        var pat = reUnion(match.map(regexpOrLiteral));
                        var regexp = new RegExp(pat);
                        if (regexp.test("")) {
                            throw new Error("RegExp matches empty string: " + regexp)
                        }
                        var groupCount = reGroups(pat);
                        if (groupCount > 0) {
                            throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: … ) instead")
                        }
                        if (!options.lineBreaks && regexp.test("\n")) {
                            throw new Error("Rule should declare lineBreaks: " + regexp)
                        }
                        parts.push(reCapture(pat))
                    }
                    var fallbackRule = errorRule && errorRule.fallback;
                    var flags = hasSticky && !fallbackRule ? "ym" : "gm";
                    var suffix = hasSticky || fallbackRule ? "" : "|";
                    if (unicodeFlag === true) flags += "u";
                    var combined = new RegExp(reUnion(parts) + suffix, flags);
                    return {
                        regexp: combined,
                        groups,
                        fast,
                        error: errorRule || defaultErrorRule
                    }
                }

                function compile(rules) {
                    var result = compileRules(toRules(rules));
                    return new Lexer({
                        start: result
                    }, "start")
                }

                function checkStateGroup(g, name, map) {
                    var state = g && (g.push || g.next);
                    if (state && !map[state]) {
                        throw new Error("Missing state '" + state + "' (in token '" + g.defaultType + "' of state '" + name + "')")
                    }
                    if (g && g.pop && +g.pop !== 1) {
                        throw new Error("pop must be 1 (in token '" + g.defaultType + "' of state '" + name + "')")
                    }
                }

                function compileStates(states, start) {
                    var all = states.$all ? toRules(states.$all) : [];
                    delete states.$all;
                    var keys = Object.getOwnPropertyNames(states);
                    if (!start) start = keys[0];
                    var ruleMap = Object.create(null);
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        ruleMap[key] = toRules(states[key]).concat(all)
                    }
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        var rules = ruleMap[key];
                        var included = Object.create(null);
                        for (var j = 0; j < rules.length; j++) {
                            var rule = rules[j];
                            if (!rule.include) continue;
                            var splice = [j, 1];
                            if (rule.include !== key && !included[rule.include]) {
                                included[rule.include] = true;
                                var newRules = ruleMap[rule.include];
                                if (!newRules) {
                                    throw new Error("Cannot include nonexistent state '" + rule.include + "' (in state '" + key + "')")
                                }
                                for (var k = 0; k < newRules.length; k++) {
                                    var newRule = newRules[k];
                                    if (rules.indexOf(newRule) !== -1) continue;
                                    splice.push(newRule)
                                }
                            }
                            rules.splice.apply(rules, splice);
                            j--
                        }
                    }
                    var map = Object.create(null);
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        map[key] = compileRules(ruleMap[key], true)
                    }
                    for (var i = 0; i < keys.length; i++) {
                        var name = keys[i];
                        var state = map[name];
                        var groups = state.groups;
                        for (var j = 0; j < groups.length; j++) {
                            checkStateGroup(groups[j], name, map)
                        }
                        var fastKeys = Object.getOwnPropertyNames(state.fast);
                        for (var j = 0; j < fastKeys.length; j++) {
                            checkStateGroup(state.fast[fastKeys[j]], name, map)
                        }
                    }
                    return new Lexer(map, start)
                }

                function keywordTransform(map) {
                    var isMap = typeof Map !== "undefined";
                    var reverseMap = isMap ? new Map : Object.create(null);
                    var types = Object.getOwnPropertyNames(map);
                    for (var i = 0; i < types.length; i++) {
                        var tokenType = types[i];
                        var item = map[tokenType];
                        var keywordList = Array.isArray(item) ? item : [item];
                        keywordList.forEach((function(keyword) {
                            if (typeof keyword !== "string") {
                                throw new Error("keyword must be string (in keyword '" + tokenType + "')")
                            }
                            if (isMap) {
                                reverseMap.set(keyword, tokenType)
                            } else {
                                reverseMap[keyword] = tokenType
                            }
                        }))
                    }
                    return function(k) {
                        return isMap ? reverseMap.get(k) : reverseMap[k]
                    }
                }
                var Lexer = function(states, state) {
                    this.startState = state;
                    this.states = states;
                    this.buffer = "";
                    this.stack = [];
                    this.reset()
                };
                Lexer.prototype.reset = function(data, info) {
                    this.buffer = data || "";
                    this.index = 0;
                    this.line = info ? info.line : 1;
                    this.col = info ? info.col : 1;
                    this.queuedToken = info ? info.queuedToken : null;
                    this.queuedText = info ? info.queuedText : "";
                    this.queuedThrow = info ? info.queuedThrow : null;
                    this.setState(info ? info.state : this.startState);
                    this.stack = info && info.stack ? info.stack.slice() : [];
                    return this
                };
                Lexer.prototype.save = function() {
                    return {
                        line: this.line,
                        col: this.col,
                        state: this.state,
                        stack: this.stack.slice(),
                        queuedToken: this.queuedToken,
                        queuedText: this.queuedText,
                        queuedThrow: this.queuedThrow
                    }
                };
                Lexer.prototype.setState = function(state) {
                    if (!state || this.state === state) return;
                    this.state = state;
                    var info = this.states[state];
                    this.groups = info.groups;
                    this.error = info.error;
                    this.re = info.regexp;
                    this.fast = info.fast
                };
                Lexer.prototype.popState = function() {
                    this.setState(this.stack.pop())
                };
                Lexer.prototype.pushState = function(state) {
                    this.stack.push(this.state);
                    this.setState(state)
                };
                var eat = hasSticky ? function(re, buffer) {
                    return re.exec(buffer)
                } : function(re, buffer) {
                    var match = re.exec(buffer);
                    if (match[0].length === 0) {
                        return null
                    }
                    return match
                };
                Lexer.prototype._getGroup = function(match) {
                    var groupCount = this.groups.length;
                    for (var i = 0; i < groupCount; i++) {
                        if (match[i + 1] !== undefined) {
                            return this.groups[i]
                        }
                    }
                    throw new Error("Cannot find token type for matched text")
                };

                function tokenToString() {
                    return this.value
                }
                Lexer.prototype.next = function() {
                    var index = this.index;
                    if (this.queuedGroup) {
                        var token = this._token(this.queuedGroup, this.queuedText, index);
                        this.queuedGroup = null;
                        this.queuedText = "";
                        return token
                    }
                    var buffer = this.buffer;
                    if (index === buffer.length) {
                        return
                    }
                    var group = this.fast[buffer.charCodeAt(index)];
                    if (group) {
                        return this._token(group, buffer.charAt(index), index)
                    }
                    var re = this.re;
                    re.lastIndex = index;
                    var match = eat(re, buffer);
                    var error = this.error;
                    if (match == null) {
                        return this._token(error, buffer.slice(index, buffer.length), index)
                    }
                    var group = this._getGroup(match);
                    var text = match[0];
                    if (error.fallback && match.index !== index) {
                        this.queuedGroup = group;
                        this.queuedText = text;
                        return this._token(error, buffer.slice(index, match.index), index)
                    }
                    return this._token(group, text, index)
                };
                Lexer.prototype._token = function(group, text, offset) {
                    var lineBreaks = 0;
                    if (group.lineBreaks) {
                        var matchNL = /\n/g;
                        var nl = 1;
                        if (text === "\n") {
                            lineBreaks = 1
                        } else {
                            while (matchNL.exec(text)) {
                                lineBreaks++;
                                nl = matchNL.lastIndex
                            }
                        }
                    }
                    var token = {
                        type: typeof group.type === "function" && group.type(text) || group.defaultType,
                        value: typeof group.value === "function" ? group.value(text) : text,
                        text,
                        toString: tokenToString,
                        offset,
                        lineBreaks,
                        line: this.line,
                        col: this.col
                    };
                    var size = text.length;
                    this.index += size;
                    this.line += lineBreaks;
                    if (lineBreaks !== 0) {
                        this.col = size - nl + 1
                    } else {
                        this.col += size
                    }
                    if (group.shouldThrow) {
                        var err = new Error(this.formatError(token, "invalid syntax"));
                        throw err
                    }
                    if (group.pop) this.popState();
                    else if (group.push) this.pushState(group.push);
                    else if (group.next) this.setState(group.next);
                    return token
                };
                if (typeof Symbol !== "undefined" && Symbol.iterator) {
                    var LexerIterator = function(lexer) {
                        this.lexer = lexer
                    };
                    LexerIterator.prototype.next = function() {
                        var token = this.lexer.next();
                        return {
                            value: token,
                            done: !token
                        }
                    };
                    LexerIterator.prototype[Symbol.iterator] = function() {
                        return this
                    };
                    Lexer.prototype[Symbol.iterator] = function() {
                        return new LexerIterator(this)
                    }
                }
                Lexer.prototype.formatError = function(token, message) {
                    if (token == null) {
                        var text = this.buffer.slice(this.index);
                        var token = {
                            text,
                            offset: this.index,
                            lineBreaks: text.indexOf("\n") === -1 ? 0 : 1,
                            line: this.line,
                            col: this.col
                        }
                    }
                    var numLinesAround = 2;
                    var firstDisplayedLine = Math.max(token.line - numLinesAround, 1);
                    var lastDisplayedLine = token.line + numLinesAround;
                    var lastLineDigits = String(lastDisplayedLine).length;
                    var displayedLines = lastNLines(this.buffer, this.line - token.line + numLinesAround + 1).slice(0, 5);
                    var errorLines = [];
                    errorLines.push(message + " at line " + token.line + " col " + token.col + ":");
                    errorLines.push("");
                    for (var i = 0; i < displayedLines.length; i++) {
                        var line = displayedLines[i];
                        var lineNo = firstDisplayedLine + i;
                        errorLines.push(pad(String(lineNo), lastLineDigits) + "  " + line);
                        if (lineNo === token.line) {
                            errorLines.push(pad("", lastLineDigits + token.col + 1) + "^")
                        }
                    }
                    return errorLines.join("\n")
                };
                Lexer.prototype.clone = function() {
                    return new Lexer(this.states, this.state)
                };
                Lexer.prototype.has = function(tokenType) {
                    return true
                };
                return {
                    compile,
                    states: compileStates,
                    error: Object.freeze({
                        error: true
                    }),
                    fallback: Object.freeze({
                        fallback: true
                    }),
                    keywords: keywordTransform
                }
            }))
        },
        "./node_modules/nearley/lib/nearley.js": function(module) {
            (function(root, factory) {
                if (true && module.exports) {
                    module.exports = factory()
                } else {
                    root.nearley = factory()
                }
            })(this, (function() {
                function Rule(name, symbols, postprocess) {
                    this.id = ++Rule.highestId;
                    this.name = name;
                    this.symbols = symbols;
                    this.postprocess = postprocess;
                    return this
                }
                Rule.highestId = 0;
                Rule.prototype.toString = function(withCursorAt) {
                    var symbolSequence = typeof withCursorAt === "undefined" ? this.symbols.map(getSymbolShortDisplay).join(" ") : this.symbols.slice(0, withCursorAt).map(getSymbolShortDisplay).join(" ") + " ● " + this.symbols.slice(withCursorAt).map(getSymbolShortDisplay).join(" ");
                    return this.name + " → " + symbolSequence
                };

                function State(rule, dot, reference, wantedBy) {
                    this.rule = rule;
                    this.dot = dot;
                    this.reference = reference;
                    this.data = [];
                    this.wantedBy = wantedBy;
                    this.isComplete = this.dot === rule.symbols.length
                }
                State.prototype.toString = function() {
                    return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0)
                };
                State.prototype.nextState = function(child) {
                    var state = new State(this.rule, this.dot + 1, this.reference, this.wantedBy);
                    state.left = this;
                    state.right = child;
                    if (state.isComplete) {
                        state.data = state.build();
                        state.right = undefined
                    }
                    return state
                };
                State.prototype.build = function() {
                    var children = [];
                    var node = this;
                    do {
                        children.push(node.right.data);
                        node = node.left
                    } while (node.left);
                    children.reverse();
                    return children
                };
                State.prototype.finish = function() {
                    if (this.rule.postprocess) {
                        this.data = this.rule.postprocess(this.data, this.reference, Parser.fail)
                    }
                };

                function Column(grammar, index) {
                    this.grammar = grammar;
                    this.index = index;
                    this.states = [];
                    this.wants = {};
                    this.scannable = [];
                    this.completed = {}
                }
                Column.prototype.process = function(nextColumn) {
                    var states = this.states;
                    var wants = this.wants;
                    var completed = this.completed;
                    for (var w = 0; w < states.length; w++) {
                        var state = states[w];
                        if (state.isComplete) {
                            state.finish();
                            if (state.data !== Parser.fail) {
                                var wantedBy = state.wantedBy;
                                for (var i = wantedBy.length; i--;) {
                                    var left = wantedBy[i];
                                    this.complete(left, state)
                                }
                                if (state.reference === this.index) {
                                    var exp = state.rule.name;
                                    (this.completed[exp] = this.completed[exp] || []).push(state)
                                }
                            }
                        } else {
                            var exp = state.rule.symbols[state.dot];
                            if (typeof exp !== "string") {
                                this.scannable.push(state);
                                continue
                            }
                            if (wants[exp]) {
                                wants[exp].push(state);
                                if (completed.hasOwnProperty(exp)) {
                                    var nulls = completed[exp];
                                    for (var i = 0; i < nulls.length; i++) {
                                        var right = nulls[i];
                                        this.complete(state, right)
                                    }
                                }
                            } else {
                                wants[exp] = [state];
                                this.predict(exp)
                            }
                        }
                    }
                };
                Column.prototype.predict = function(exp) {
                    var rules = this.grammar.byName[exp] || [];
                    for (var i = 0; i < rules.length; i++) {
                        var r = rules[i];
                        var wantedBy = this.wants[exp];
                        var s = new State(r, 0, this.index, wantedBy);
                        this.states.push(s)
                    }
                };
                Column.prototype.complete = function(left, right) {
                    var copy = left.nextState(right);
                    this.states.push(copy)
                };

                function Grammar(rules, start) {
                    this.rules = rules;
                    this.start = start || this.rules[0].name;
                    var byName = this.byName = {};
                    this.rules.forEach((function(rule) {
                        if (!byName.hasOwnProperty(rule.name)) {
                            byName[rule.name] = []
                        }
                        byName[rule.name].push(rule)
                    }))
                }
                Grammar.fromCompiled = function(rules, start) {
                    var lexer = rules.Lexer;
                    if (rules.ParserStart) {
                        start = rules.ParserStart;
                        rules = rules.ParserRules
                    }
                    var rules = rules.map((function(r) {
                        return new Rule(r.name, r.symbols, r.postprocess)
                    }));
                    var g = new Grammar(rules, start);
                    g.lexer = lexer;
                    return g
                };

                function StreamLexer() {
                    this.reset("")
                }
                StreamLexer.prototype.reset = function(data, state) {
                    this.buffer = data;
                    this.index = 0;
                    this.line = state ? state.line : 1;
                    this.lastLineBreak = state ? -state.col : 0
                };
                StreamLexer.prototype.next = function() {
                    if (this.index < this.buffer.length) {
                        var ch = this.buffer[this.index++];
                        if (ch === "\n") {
                            this.line += 1;
                            this.lastLineBreak = this.index
                        }
                        return {
                            value: ch
                        }
                    }
                };
                StreamLexer.prototype.save = function() {
                    return {
                        line: this.line,
                        col: this.index - this.lastLineBreak
                    }
                };
                StreamLexer.prototype.formatError = function(token, message) {
                    var buffer = this.buffer;
                    if (typeof buffer === "string") {
                        var lines = buffer.split("\n").slice(Math.max(0, this.line - 5), this.line);
                        var nextLineBreak = buffer.indexOf("\n", this.index);
                        if (nextLineBreak === -1) nextLineBreak = buffer.length;
                        var col = this.index - this.lastLineBreak;
                        var lastLineDigits = String(this.line).length;
                        message += " at line " + this.line + " col " + col + ":\n\n";
                        message += lines.map((function(line, i) {
                            return pad(this.line - lines.length + i + 1, lastLineDigits) + " " + line
                        }), this).join("\n");
                        message += "\n" + pad("", lastLineDigits + col) + "^\n";
                        return message
                    } else {
                        return message + " at index " + (this.index - 1)
                    }

                    function pad(n, length) {
                        var s = String(n);
                        return Array(length - s.length + 1).join(" ") + s
                    }
                };

                function Parser(rules, start, options) {
                    if (rules instanceof Grammar) {
                        var grammar = rules;
                        var options = start
                    } else {
                        var grammar = Grammar.fromCompiled(rules, start)
                    }
                    this.grammar = grammar;
                    this.options = {
                        keepHistory: false,
                        lexer: grammar.lexer || new StreamLexer
                    };
                    for (var key in options || {}) {
                        this.options[key] = options[key]
                    }
                    this.lexer = this.options.lexer;
                    this.lexerState = undefined;
                    var column = new Column(grammar, 0);
                    var table = this.table = [column];
                    column.wants[grammar.start] = [];
                    column.predict(grammar.start);
                    column.process();
                    this.current = 0
                }
                Parser.fail = {};
                Parser.prototype.feed = function(chunk) {
                    var lexer = this.lexer;
                    lexer.reset(chunk, this.lexerState);
                    var token;
                    while (true) {
                        try {
                            token = lexer.next();
                            if (!token) {
                                break
                            }
                        } catch (e) {
                            var nextColumn = new Column(this.grammar, this.current + 1);
                            this.table.push(nextColumn);
                            var err = new Error(this.reportLexerError(e));
                            err.offset = this.current;
                            err.token = e.token;
                            throw err
                        }
                        var column = this.table[this.current];
                        if (!this.options.keepHistory) {
                            delete this.table[this.current - 1]
                        }
                        var n = this.current + 1;
                        var nextColumn = new Column(this.grammar, n);
                        this.table.push(nextColumn);
                        var literal = token.text !== undefined ? token.text : token.value;
                        var value = lexer.constructor === StreamLexer ? token.value : token;
                        var scannable = column.scannable;
                        for (var w = scannable.length; w--;) {
                            var state = scannable[w];
                            var expect = state.rule.symbols[state.dot];
                            if (expect.test ? expect.test(value) : expect.type ? expect.type === token.type : expect.literal === literal) {
                                var next = state.nextState({
                                    data: value,
                                    token,
                                    isToken: true,
                                    reference: n - 1
                                });
                                nextColumn.states.push(next)
                            }
                        }
                        nextColumn.process();
                        if (nextColumn.states.length === 0) {
                            var err = new Error(this.reportError(token));
                            err.offset = this.current;
                            err.token = token;
                            throw err
                        }
                        if (this.options.keepHistory) {
                            column.lexerState = lexer.save()
                        }
                        this.current++
                    }
                    if (column) {
                        this.lexerState = lexer.save()
                    }
                    this.results = this.finish();
                    return this
                };
                Parser.prototype.reportLexerError = function(lexerError) {
                    var tokenDisplay, lexerMessage;
                    var token = lexerError.token;
                    if (token) {
                        tokenDisplay = "input " + JSON.stringify(token.text[0]) + " (lexer error)";
                        lexerMessage = this.lexer.formatError(token, "Syntax error")
                    } else {
                        tokenDisplay = "input (lexer error)";
                        lexerMessage = lexerError.message
                    }
                    return this.reportErrorCommon(lexerMessage, tokenDisplay)
                };
                Parser.prototype.reportError = function(token) {
                    var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== undefined ? token.value : token);
                    var lexerMessage = this.lexer.formatError(token, "Syntax error");
                    return this.reportErrorCommon(lexerMessage, tokenDisplay)
                };
                Parser.prototype.reportErrorCommon = function(lexerMessage, tokenDisplay) {
                    var lines = [];
                    lines.push(lexerMessage);
                    var lastColumnIndex = this.table.length - 2;
                    var lastColumn = this.table[lastColumnIndex];
                    var expectantStates = lastColumn.states.filter((function(state) {
                        var nextSymbol = state.rule.symbols[state.dot];
                        return nextSymbol && typeof nextSymbol !== "string"
                    }));
                    if (expectantStates.length === 0) {
                        lines.push("Unexpected " + tokenDisplay + ". I did not expect any more input. Here is the state of my parse table:\n");
                        this.displayStateStack(lastColumn.states, lines)
                    } else {
                        lines.push("Unexpected " + tokenDisplay + ". Instead, I was expecting to see one of the following:\n");
                        var stateStacks = expectantStates.map((function(state) {
                            return this.buildFirstStateStack(state, []) || [state]
                        }), this);
                        stateStacks.forEach((function(stateStack) {
                            var state = stateStack[0];
                            var nextSymbol = state.rule.symbols[state.dot];
                            var symbolDisplay = this.getSymbolDisplay(nextSymbol);
                            lines.push("A " + symbolDisplay + " based on:");
                            this.displayStateStack(stateStack, lines)
                        }), this)
                    }
                    lines.push("");
                    return lines.join("\n")
                };
                Parser.prototype.displayStateStack = function(stateStack, lines) {
                    var lastDisplay;
                    var sameDisplayCount = 0;
                    for (var j = 0; j < stateStack.length; j++) {
                        var state = stateStack[j];
                        var display = state.rule.toString(state.dot);
                        if (display === lastDisplay) {
                            sameDisplayCount++
                        } else {
                            if (sameDisplayCount > 0) {
                                lines.push("    ^ " + sameDisplayCount + " more lines identical to this")
                            }
                            sameDisplayCount = 0;
                            lines.push("    " + display)
                        }
                        lastDisplay = display
                    }
                };
                Parser.prototype.getSymbolDisplay = function(symbol) {
                    return getSymbolLongDisplay(symbol)
                };
                Parser.prototype.buildFirstStateStack = function(state, visited) {
                    if (visited.indexOf(state) !== -1) {
                        return null
                    }
                    if (state.wantedBy.length === 0) {
                        return [state]
                    }
                    var prevState = state.wantedBy[0];
                    var childVisited = [state].concat(visited);
                    var childResult = this.buildFirstStateStack(prevState, childVisited);
                    if (childResult === null) {
                        return null
                    }
                    return [state].concat(childResult)
                };
                Parser.prototype.save = function() {
                    var column = this.table[this.current];
                    column.lexerState = this.lexerState;
                    return column
                };
                Parser.prototype.restore = function(column) {
                    var index = column.index;
                    this.current = index;
                    this.table[index] = column;
                    this.table.splice(index + 1);
                    this.lexerState = column.lexerState;
                    this.results = this.finish()
                };
                Parser.prototype.rewind = function(index) {
                    if (!this.options.keepHistory) {
                        throw new Error("set option `keepHistory` to enable rewinding")
                    }
                    this.restore(this.table[index])
                };
                Parser.prototype.finish = function() {
                    var considerations = [];
                    var start = this.grammar.start;
                    var column = this.table[this.table.length - 1];
                    column.states.forEach((function(t) {
                        if (t.rule.name === start && t.dot === t.rule.symbols.length && t.reference === 0 && t.data !== Parser.fail) {
                            considerations.push(t)
                        }
                    }));
                    return considerations.map((function(c) {
                        return c.data
                    }))
                };

                function getSymbolLongDisplay(symbol) {
                    var type = typeof symbol;
                    if (type === "string") {
                        return symbol
                    } else if (type === "object") {
                        if (symbol.literal) {
                            return JSON.stringify(symbol.literal)
                        } else if (symbol instanceof RegExp) {
                            return "character matching " + symbol
                        } else if (symbol.type) {
                            return symbol.type + " token"
                        } else if (symbol.test) {
                            return "token matching " + String(symbol.test)
                        } else {
                            throw new Error("Unknown symbol type: " + symbol)
                        }
                    }
                }

                function getSymbolShortDisplay(symbol) {
                    var type = typeof symbol;
                    if (type === "string") {
                        return symbol
                    } else if (type === "object") {
                        if (symbol.literal) {
                            return JSON.stringify(symbol.literal)
                        } else if (symbol instanceof RegExp) {
                            return symbol.toString()
                        } else if (symbol.type) {
                            return "%" + symbol.type
                        } else if (symbol.test) {
                            return "<" + String(symbol.test) + ">"
                        } else {
                            throw new Error("Unknown symbol type: " + symbol)
                        }
                    }
                }
                return {
                    Parser,
                    Grammar,
                    Rule
                }
            }))
        },
        "./gen/Expression.ts": (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, {
                default: () => __WEBPACK_DEFAULT_EXPORT__
            });
            var _src_Lexer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/Lexer.ts");
            var _src_AST__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./src/AST.ts");

            function id(d) {
                return d[0]
            }
            const grammar = {
                Lexer: _src_Lexer__WEBPACK_IMPORTED_MODULE_0__.lexer,
                ParserRules: [{
                    name: "expression0",
                    symbols: [{
                        literal: "let"
                    }, _src_Lexer__WEBPACK_IMPORTED_MODULE_0__.lexer.has("name") ? {
                        type: "name"
                    } : name, {
                        literal: "="
                    }, "expression0", {
                        literal: "in"
                    }, "expression0"],
                    postprocess: ([, n, , d, , b]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkLet)(n.value, d, b)
                }, {
                    name: "expression0",
                    symbols: [{
                        literal: "letfun"
                    }, _src_Lexer__WEBPACK_IMPORTED_MODULE_0__.lexer.has("name") ? {
                        type: "name"
                    } : name, {
                        literal: "("
                    }, _src_Lexer__WEBPACK_IMPORTED_MODULE_0__.lexer.has("name") ? {
                        type: "name"
                    } : name, {
                        literal: ")"
                    }, {
                        literal: "="
                    }, "expression0", {
                        literal: "in"
                    }, "expression0"],
                    postprocess: ([, fn, , pn, , , d, , b]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkLetFun)(fn.value, pn.value, d, b)
                }, {
                    name: "expression0",
                    symbols: [{
                        literal: "if"
                    }, "expression0", {
                        literal: "then"
                    }, "expression0", {
                        literal: "else"
                    }, "expression0"],
                    postprocess: ([, i, , t, , f]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkConditional)(i, t, f)
                }, {
                    name: "expression0",
                    symbols: ["expression1"],
                    postprocess: id
                }, {
                    name: "expression1",
                    symbols: ["expression1", {
                        literal: "||"
                    }, "expression2"],
                    postprocess: ([left, , right]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkOr)(left, right)
                }, {
                    name: "expression1",
                    symbols: ["expression2"],
                    postprocess: id
                }, {
                    name: "expression2",
                    symbols: ["expression2", {
                        literal: "&&"
                    }, "expression3"],
                    postprocess: ([left, , right]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkAnd)(left, right)
                }, {
                    name: "expression2",
                    symbols: ["expression3"],
                    postprocess: id
                }, {
                    name: "expression3",
                    symbols: ["expression4", {
                        literal: "=="
                    }, "expression4"],
                    postprocess: ([left, , right]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkEquals)(left, right)
                }, {
                    name: "expression3",
                    symbols: ["expression4", {
                        literal: ">"
                    }, "expression4"],
                    postprocess: ([left, , right]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkGreater)(left, right)
                }, {
                    name: "expression3",
                    symbols: ["expression4"],
                    postprocess: id
                }, {
                    name: "expression4",
                    symbols: ["expression4", {
                        literal: "+"
                    }, "expression5"],
                    postprocess: ([left, , right]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkPlus)(left, right)
                }, {
                    name: "expression4",
                    symbols: ["expression4", {
                        literal: "-"
                    }, "expression5"],
                    postprocess: ([left, , right]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkMinus)(left, right)
                }, {
                    name: "expression4",
                    symbols: ["expression5"],
                    postprocess: id
                }, {
                    name: "expression5",
                    symbols: ["expression5", {
                        literal: "*"
                    }, "expression6"],
                    postprocess: ([left, , right]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkTimes)(left, right)
                }, {
                    name: "expression5",
                    symbols: ["expression6"],
                    postprocess: id
                }, {
                    name: "expression6",
                    symbols: ["expression7", {
                        literal: "^"
                    }, "expression6"],
                    postprocess: ([left, , right]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkExponent)(left, right)
                }, {
                    name: "expression6",
                    symbols: ["expression7"],
                    postprocess: id
                }, {
                    name: "expression7",
                    symbols: [{
                        literal: "-"
                    }, "expression7"],
                    postprocess: ([, sub]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkNegate)(sub)
                }, {
                    name: "expression7",
                    symbols: [{
                        literal: "!"
                    }, "expression7"],
                    postprocess: ([, sub]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkNot)(sub)
                }, {
                    name: "expression7",
                    symbols: ["expression8"],
                    postprocess: id
                }, {
                    name: "expression8",
                    symbols: [_src_Lexer__WEBPACK_IMPORTED_MODULE_0__.lexer.has("name") ? {
                        type: "name"
                    } : name, {
                        literal: "("
                    }, "expression0", {
                        literal: ")"
                    }],
                    postprocess: ([fn, , arg, , ]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkApp)(fn, arg)
                }, {
                    name: "expression8",
                    symbols: ["atom"],
                    postprocess: id
                }, {
                    name: "atom",
                    symbols: [{
                        literal: "("
                    }, "expression0", {
                        literal: ")"
                    }],
                    postprocess: ([, sub]) => sub
                }, {
                    name: "atom",
                    symbols: [_src_Lexer__WEBPACK_IMPORTED_MODULE_0__.lexer.has("number") ? {
                        type: "number"
                    } : number],
                    postprocess: ([n]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkNum)(n.value)
                }, {
                    name: "atom",
                    symbols: [{
                        literal: "true"
                    }],
                    postprocess: ([]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkBool)(true)
                }, {
                    name: "atom",
                    symbols: [{
                        literal: "false"
                    }],
                    postprocess: ([]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkBool)(false)
                }, {
                    name: "atom",
                    symbols: [_src_Lexer__WEBPACK_IMPORTED_MODULE_0__.lexer.has("name") ? {
                        type: "name"
                    } : name],
                    postprocess: ([n]) => (0, _src_AST__WEBPACK_IMPORTED_MODULE_1__.mkName)(n.value)
                }],
                ParserStart: "expression0"
            };
            const __WEBPACK_DEFAULT_EXPORT__ = grammar
        },
        "./src/AST.ts": (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, {
                mkAnd: () => mkAnd,
                mkApp: () => mkApp,
                mkBool: () => mkBool,
                mkConditional: () => mkConditional,
                mkEquals: () => mkEquals,
                mkExponent: () => mkExponent,
                mkGreater: () => mkGreater,
                mkLet: () => mkLet,
                mkLetFun: () => mkLetFun,
                mkMinus: () => mkMinus,
                mkName: () => mkName,
                mkNegate: () => mkNegate,
                mkNot: () => mkNot,
                mkNum: () => mkNum,
                mkOr: () => mkOr,
                mkPlus: () => mkPlus,
                mkTimes: () => mkTimes,
                treeToString: () => treeToString
            });

            function mkPlus(l, r) {
                return {
                    tag: "plus",
                    leftSubtree: l,
                    rightSubtree: r
                }
            }

            function mkMinus(l, r) {
                return {
                    tag: "minus",
                    leftSubtree: l,
                    rightSubtree: r
                }
            }

            function mkTimes(l, r) {
                return {
                    tag: "times",
                    leftSubtree: l,
                    rightSubtree: r
                }
            }

            function mkExponent(l, r) {
                return {
                    tag: "exponent",
                    leftSubtree: l,
                    rightSubtree: r
                }
            }

            function mkNegate(t) {
                return {
                    tag: "negate",
                    subtree: t
                }
            }

            function mkOr(l, r) {
                return {
                    tag: "or",
                    leftSubtree: l,
                    rightSubtree: r
                }
            }

            function mkAnd(l, r) {
                return {
                    tag: "and",
                    leftSubtree: l,
                    rightSubtree: r
                }
            }

            function mkNot(t) {
                return {
                    tag: "not",
                    subtree: t
                }
            }

            function mkEquals(l, r) {
                return {
                    tag: "equals",
                    leftSubtree: l,
                    rightSubtree: r
                }
            }

            function mkGreater(l, r) {
                return {
                    tag: "greater",
                    leftSubtree: l,
                    rightSubtree: r
                }
            }

            function mkLet(n, d, b) {
                return {
                    tag: "let",
                    name: n,
                    defSubtree: d,
                    bodySubtree: b
                }
            }

            function mkLetFun(fn, pn, d, b) {
                return {
                    tag: "letfun",
                    funName: fn,
                    paramName: pn,
                    defSubtree: d,
                    bodySubtree: b
                }
            }

            function mkApp(fn, arg) {
                return {
                    tag: "app",
                    funName: fn,
                    subtree: arg
                }
            }

            function mkConditional(t, tr, fa) {
                return {
                    tag: "conditional",
                    testSubtree: t,
                    trueSubtree: tr,
                    falseSubtree: fa
                }
            }

            function mkNum(n) {
                return {
                    tag: "num",
                    value: parseInt(n)
                }
            }

            function mkBool(b) {
                return {
                    tag: "bool",
                    value: b
                }
            }

            function mkName(name) {
                return {
                    tag: "name",
                    name
                }
            }

            function treeToString(tree) {
                switch (tree.tag) {
                    case "plus":
                        return "(" + treeToString(tree.leftSubtree) + " + " + treeToString(tree.rightSubtree) + ")";
                    case "minus":
                        return "(" + treeToString(tree.leftSubtree) + " - " + treeToString(tree.rightSubtree) + ")";
                    case "times":
                        return "(" + treeToString(tree.leftSubtree) + " * " + treeToString(tree.rightSubtree) + ")";
                    case "exponent":
                        return "(" + treeToString(tree.leftSubtree) + " ^ " + treeToString(tree.rightSubtree) + ")";
                    case "negate":
                        return "(- " + treeToString(tree.subtree) + ")";
                    case "or":
                        return "(" + treeToString(tree.leftSubtree) + " || " + treeToString(tree.rightSubtree) + ")";
                    case "and":
                        return "(" + treeToString(tree.leftSubtree) + " && " + treeToString(tree.rightSubtree) + ")";
                    case "equals":
                        return "(" + treeToString(tree.leftSubtree) + " == " + treeToString(tree.rightSubtree) + ")";
                    case "greater":
                        return "(" + treeToString(tree.leftSubtree) + " > " + treeToString(tree.rightSubtree) + ")";
                    case "let":
                        return "(let " + tree.name + " = " + treeToString(tree.defSubtree) + " in " + treeToString(tree.bodySubtree) + ")";
                    case "letfun":
                        return "(letfun " + tree.funName + " (" + tree.paramName + ") = " + treeToString(tree.defSubtree) + " in " + treeToString(tree.bodySubtree) + ")";
                    case "app":
                        return "(" + tree.funName + " (" + treeToString(tree.subtree) + "))";
                    case "conditional":
                        return "(if " + treeToString(tree.testSubtree) + " then " + treeToString(tree.trueSubtree) + " else " + treeToString(tree.falseSubtree) + ")";
                    case "not":
                        return "(" + "! " + treeToString(tree.subtree) + ")";
                    case "num":
                        return tree.value.toString();
                    case "bool":
                        return tree.value.toString();
                    case "name":
                        return tree.name
                }
            }
        },
        "./src/InterpA.ts": (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, {
                interpret: () => interpret
            });
            var _Values__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/Values.ts");

            function interpret(tree, env = _Values__WEBPACK_IMPORTED_MODULE_0__.emptyEnv) {
                switch (tree.tag) {
                    case "plus": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(lv.value + rv.value)
                    }
                    case "minus": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(lv.value - rv.value)
                    }
                    case "times": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(lv.value * rv.value)
                    }
                    case "exponent": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(Math.pow(lv.value, rv.value))
                    }
                    case "negate": {
                        const v = interpret(tree.subtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(v);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(-v.value)
                    }
                    case "or": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value || rv.value)
                    }
                    case "and": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value && rv.value)
                    }
                    case "not": {
                        const v = interpret(tree.subtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(v);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(!v.value)
                    }
                    case "equals": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNumOrBool)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNumOrBool)(rv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertV)(lv.tag == rv.tag, "expected " + lv.tag + ", got " + rv.tag);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value === rv.value)
                    }
                    case "greater": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value > rv.value)
                    }
                    case "let": {
                        const v = interpret(tree.defSubtree, env);
                        const newEnv = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.extendEnv)(tree.name, v, env);
                        return interpret(tree.bodySubtree, newEnv)
                    }
                    case "letfun": {
                        let c = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkClosureV)(tree.paramName, tree.defSubtree, env);
                        let newEnv = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.extendEnv)(tree.funName, c, env);
                        c.env = newEnv;
                        return interpret(tree.bodySubtree, newEnv)
                    }
                    case "app": {
                        const f = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.lookupEnv)(tree.funName, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertClosure)(f);
                        const v = interpret(tree.subtree, env);
                        let newEnv = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.extendEnv)(f.param, v, env);
                        return interpret(f.body, newEnv)
                    }
                    case "conditional":
                        const testv = interpret(tree.testSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(testv);
                        return testv.value ? interpret(tree.trueSubtree, env) : interpret(tree.falseSubtree, env);
                    case "num":
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(tree.value);
                    case "bool":
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(tree.value);
                    case "name":
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.lookupEnv)(tree.name, env)
                }
            }
        },
        "./src/InterpB.ts": (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, {
                interpret: () => interpret
            });
            var _Values__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/Values.ts");

            function interpret(tree, env = _Values__WEBPACK_IMPORTED_MODULE_0__.emptyEnv) {
                switch (tree.tag) {
                    case "plus": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(lv.value + rv.value)
                    }
                    case "minus": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(lv.value - rv.value)
                    }
                    case "times": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(lv.value * rv.value)
                    }
                    case "exponent": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(Math.pow(lv.value, rv.value))
                    }
                    case "negate": {
                        const v = interpret(tree.subtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(v);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(-v.value)
                    }
                    case "or": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value || rv.value)
                    }
                    case "and": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value && rv.value)
                    }
                    case "not": {
                        const v = interpret(tree.subtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(v);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(!v.value)
                    }
                    case "equals": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNumOrBool)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNumOrBool)(rv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertV)(lv.tag == rv.tag, "expected " + lv.tag + ", got " + rv.tag);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value === rv.value)
                    }
                    case "greater": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value > rv.value)
                    }
                    case "let": {
                        const v = interpret(tree.defSubtree, env);
                        const newEnv = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.extendEnv)(tree.name, v, env);
                        return interpret(tree.bodySubtree, newEnv)
                    }
                    case "letfun": {
                        let c = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkClosureV)(tree.paramName, tree.defSubtree, env);
                        let newEnv = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.extendEnv)(tree.funName, c, env);
                        return interpret(tree.bodySubtree, newEnv)
                    }
                    case "app": {
                        const f = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.lookupEnv)(tree.funName, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertClosure)(f);
                        const v = interpret(tree.subtree, env);
                        let newEnv = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.extendEnv)(f.param, v, f.env);
                        return interpret(f.body, newEnv)
                    }
                    case "conditional":
                        const testv = interpret(tree.testSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(testv);
                        return testv.value ? interpret(tree.trueSubtree, env) : interpret(tree.falseSubtree, env);
                    case "num":
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(tree.value);
                    case "bool":
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(tree.value);
                    case "name":
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.lookupEnv)(tree.name, env)
                }
            }
        },
        "./src/InterpC.ts": (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, {
                interpret: () => interpret
            });
            var _Values__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/Values.ts");

            function interpret(tree, env = _Values__WEBPACK_IMPORTED_MODULE_0__.emptyEnv) {
                switch (tree.tag) {
                    case "plus": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(lv.value + rv.value)
                    }
                    case "minus": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(lv.value - rv.value)
                    }
                    case "times": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(lv.value * rv.value)
                    }
                    case "exponent": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(Math.pow(lv.value, rv.value))
                    }
                    case "negate": {
                        const v = interpret(tree.subtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(v);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(-v.value)
                    }
                    case "or": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value || rv.value)
                    }
                    case "and": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value && rv.value)
                    }
                    case "not": {
                        const v = interpret(tree.subtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(v);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(!v.value)
                    }
                    case "equals": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNumOrBool)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNumOrBool)(rv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertV)(lv.tag == rv.tag, "expected " + lv.tag + ", got " + rv.tag);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value === rv.value)
                    }
                    case "greater": {
                        const lv = interpret(tree.leftSubtree, env);
                        const rv = interpret(tree.rightSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value > rv.value)
                    }
                    case "let": {
                        const v = interpret(tree.defSubtree, env);
                        const newEnv = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.extendEnv)(tree.name, v, env);
                        return interpret(tree.bodySubtree, newEnv)
                    }
                    case "letfun": {
                        let c = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkClosureV)(tree.paramName, tree.defSubtree, env);
                        let newEnv = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.extendEnv)(tree.funName, c, env);
                        c.env = newEnv;
                        return interpret(tree.bodySubtree, newEnv)
                    }
                    case "app": {
                        const f = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.lookupEnv)(tree.funName, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertClosure)(f);
                        const v = interpret(tree.subtree, env);
                        let newEnv = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.extendEnv)(f.param, v, f.env);
                        return interpret(f.body, newEnv)
                    }
                    case "conditional":
                        const testv = interpret(tree.testSubtree, env);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(testv);
                        return testv.value ? interpret(tree.trueSubtree, env) : interpret(tree.falseSubtree, env);
                    case "num":
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(tree.value);
                    case "bool":
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(tree.value);
                    case "name":
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.lookupEnv)(tree.name, env)
                }
            }
        },
        "./src/InterpD.ts": (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, {
                interpret: () => interpret,
                interpret_: () => interpret_
            });
            var _Values__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/Values.ts");

            function force(v) {
                switch (v.tag) {
                    case "thunk":
                        return force(interpret_(v.body, v.env));
                    default:
                        return v
                }
            }

            function delay(b, env) {
                return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkThunkV)(b, env)
            }

            function interpret_(tree, env = _Values__WEBPACK_IMPORTED_MODULE_0__.emptyEnv) {
                switch (tree.tag) {
                    case "plus": {
                        const lv = force(interpret_(tree.leftSubtree, env));
                        const rv = force(interpret_(tree.rightSubtree, env));
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(lv.value + rv.value)
                    }
                    case "minus": {
                        const lv = force(interpret_(tree.leftSubtree, env));
                        const rv = force(interpret_(tree.rightSubtree, env));
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(lv.value - rv.value)
                    }
                    case "times": {
                        const lv = force(interpret_(tree.leftSubtree, env));
                        const rv = force(interpret_(tree.rightSubtree, env));
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(lv.value * rv.value)
                    }
                    case "exponent": {
                        const lv = force(interpret_(tree.leftSubtree, env));
                        const rv = force(interpret_(tree.rightSubtree, env));
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(Math.pow(lv.value, rv.value))
                    }
                    case "negate": {
                        const v = force(interpret_(tree.subtree, env));
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(v);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(-v.value)
                    }
                    case "or": {
                        const lv = force(interpret_(tree.leftSubtree, env));
                        const rv = force(interpret_(tree.rightSubtree, env));
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value || rv.value)
                    }
                    case "and": {
                        const lv = force(interpret_(tree.leftSubtree, env));
                        const rv = force(interpret_(tree.rightSubtree, env));
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value && rv.value)
                    }
                    case "not": {
                        const v = force(interpret_(tree.subtree, env));
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(v);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(!v.value)
                    }
                    case "equals": {
                        const lv = force(interpret_(tree.leftSubtree, env));
                        const rv = force(interpret_(tree.rightSubtree, env));
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNumOrBool)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNumOrBool)(rv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertV)(lv.tag == rv.tag, "expected " + lv.tag + ", got " + rv.tag);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value === rv.value)
                    }
                    case "greater": {
                        const lv = force(interpret_(tree.leftSubtree, env));
                        const rv = force(interpret_(tree.rightSubtree, env));
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(lv);
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertNum)(rv);
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(lv.value > rv.value)
                    }
                    case "let": {
                        const v = force(interpret_(tree.defSubtree, env));
                        const newEnv = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.extendEnv)(tree.name, v, env);
                        return interpret_(tree.bodySubtree, newEnv)
                    }
                    case "letfun": {
                        let c = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkClosureV)(tree.paramName, tree.defSubtree, env);
                        let newEnv = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.extendEnv)(tree.funName, c, env);
                        c.env = newEnv;
                        return interpret_(tree.bodySubtree, newEnv)
                    }
                    case "app": {
                        const f = force((0, _Values__WEBPACK_IMPORTED_MODULE_0__.lookupEnv)(tree.funName, env));
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertClosure)(f);
                        const arg = delay(tree.subtree, env);
                        let newEnv = (0, _Values__WEBPACK_IMPORTED_MODULE_0__.extendEnv)(f.param, arg, f.env);
                        return interpret_(f.body, newEnv)
                    }
                    case "conditional":
                        const testv = force(interpret_(tree.testSubtree, env));
                        (0, _Values__WEBPACK_IMPORTED_MODULE_0__.assertBool)(testv);
                        return testv.value ? interpret_(tree.trueSubtree, env) : interpret_(tree.falseSubtree, env);
                    case "num":
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkNumberV)(tree.value);
                    case "bool":
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.mkBooleanV)(tree.value);
                    case "name":
                        return (0, _Values__WEBPACK_IMPORTED_MODULE_0__.lookupEnv)(tree.name, env)
                }
            }

            function interpret(tree) {
                return force(interpret_(tree))
            }
        },
        "./src/Lexer.ts": (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, {
                compileLexer: () => compileLexer,
                lexer: () => lexer
            });
            var moo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./node_modules/moo/moo.js");
            var moo__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(moo__WEBPACK_IMPORTED_MODULE_0__);
            const lexingRules = {
                _: /[ \t]+/,
                number: /\d+/,
                name: {
                    match: /[A-Za-z]\w*/,
                    type: (0, moo__WEBPACK_IMPORTED_MODULE_0__.keywords)({
                        kw: ["true", "false", "let", "letfun", "in", "if", "then", "else"]
                    })
                },
                and: /&&/,
                or: /\|\|/,
                not: /!/,
                plus: /\+/,
                times: /\*/,
                divide: /\//,
                exponent: /\^/,
                minus: /-/,
                parenL: /\(/,
                parenR: /\)/,
                equal: /==/,
                is: /=/,
                nequal: /\!=/,
                lt: /</,
                lte: /<=/,
                gt: />/,
                gte: />=/,
                comma: /,/,
                semicolon: /;/,
                dot: /\./,
                at: /\@/
            };
            const compileLexer = rules => {
                const lexer = (0, moo__WEBPACK_IMPORTED_MODULE_0__.compile)(rules);
                lexer.next = (next => () => {
                    let token;
                    for (token = next.call(lexer); token && /_+/.test(token.type); token = next.call(lexer));
                    return token
                })(lexer.next);
                return lexer
            };
            const lexer = compileLexer(lexingRules)
        },
        "./src/Values.ts": (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
            "use strict";
            __webpack_require__.r(__webpack_exports__);
            __webpack_require__.d(__webpack_exports__, {
                DynamicTypeError: () => DynamicTypeError,
                EnvError: () => EnvError,
                assertBool: () => assertBool,
                assertClosure: () => assertClosure,
                assertNum: () => assertNum,
                assertNumOrBool: () => assertNumOrBool,
                assertV: () => assertV,
                emptyEnv: () => emptyEnv,
                extendEnv: () => extendEnv,
                lookupEnv: () => lookupEnv,
                mkBooleanV: () => mkBooleanV,
                mkClosureV: () => mkClosureV,
                mkNumberV: () => mkNumberV,
                mkThunkV: () => mkThunkV,
                valueToString: () => valueToString
            });
            let emptyEnv = null;

            function extendEnv(name, value, env) {
                return {
                    name,
                    value,
                    next: env
                }
            }
            class EnvError extends Error {}

            function lookupEnv(name, env) {
                if (env == null) throw new EnvError("name is not in environment: " + name);
                else if (env.name == name) return env.value;
                else return lookupEnv(name, env.next)
            }

            function valueToString(v) {
                switch (v.tag) {
                    case "number":
                    case "boolean":
                        return v.value.toString();
                    case "function":
                        return "<function>";
                    case "thunk":
                        return "<thunk>"
                }
            }

            function mkNumberV(v) {
                return {
                    tag: "number",
                    value: v
                }
            }

            function mkBooleanV(v) {
                return {
                    tag: "boolean",
                    value: v
                }
            }

            function mkClosureV(p, b, e) {
                return {
                    tag: "function",
                    param: p,
                    body: b,
                    env: e
                }
            }

            function mkThunkV(b, e) {
                return {
                    tag: "thunk",
                    body: b,
                    env: e
                }
            }
            class DynamicTypeError extends Error {}

            function assertNum(value) {
                if (value.tag != "number") throw new DynamicTypeError("expected number, got " + value.tag)
            }

            function assertBool(value) {
                if (value.tag != "boolean") throw new DynamicTypeError("expected boolean, got " + value.tag)
            }

            function assertNumOrBool(value) {
                if (value.tag != "number" && value.tag != "boolean") throw new DynamicTypeError("expected number or boolean, got " + value.tag)
            }

            function assertClosure(value) {
                if (value.tag != "function") throw new DynamicTypeError("expected function, got " + value.tag)
            }

            function assertV(condition, msg) {
                if (condition === false) throw new DynamicTypeError(msg)
            }
        }
    };
    var __webpack_module_cache__ = {};

    function __webpack_require__(moduleId) {
        var cachedModule = __webpack_module_cache__[moduleId];
        if (cachedModule !== undefined) {
            return cachedModule.exports
        }
        var module = __webpack_module_cache__[moduleId] = {
            exports: {}
        };
        __webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
        return module.exports
    }(() => {
        __webpack_require__.n = module => {
            var getter = module && module.__esModule ? () => module["default"] : () => module;
            __webpack_require__.d(getter, {
                a: getter
            });
            return getter
        }
    })();
    (() => {
        __webpack_require__.d = (exports, definition) => {
            for (var key in definition) {
                if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
                    Object.defineProperty(exports, key, {
                        enumerable: true,
                        get: definition[key]
                    })
                }
            }
        }
    })();
    (() => {
        __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
    })();
    (() => {
        __webpack_require__.r = exports => {
            if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
                Object.defineProperty(exports, Symbol.toStringTag, {
                    value: "Module"
                })
            }
            Object.defineProperty(exports, "__esModule", {
                value: true
            })
        }
    })();
    var __webpack_exports__ = {};
    (() => {
        "use strict";
        __webpack_require__.r(__webpack_exports__);
        __webpack_require__.d(__webpack_exports__, {
            AmbiguousParseError: () => AmbiguousParseError,
            ExpressionRules: () => _gen_Expression__WEBPACK_IMPORTED_MODULE_2__["default"],
            NoParseError: () => NoParseError,
            checkParseOK: () => checkParseOK,
            interpretA: () => _InterpA__WEBPACK_IMPORTED_MODULE_4__.interpret,
            interpretB: () => _InterpB__WEBPACK_IMPORTED_MODULE_5__.interpret,
            interpretC: () => _InterpC__WEBPACK_IMPORTED_MODULE_6__.interpret,
            interpretD: () => _InterpD__WEBPACK_IMPORTED_MODULE_7__.interpret,
            lex: () => lex,
            parse: () => parse,
            parseUnambiguous: () => parseUnambiguous,
            valueToString: () => _Values__WEBPACK_IMPORTED_MODULE_3__.valueToString
        });
        var _Lexer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__("./src/Lexer.ts");
        var nearley__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__("./node_modules/nearley/lib/nearley.js");
        var nearley__WEBPACK_IMPORTED_MODULE_1___default = __webpack_require__.n(nearley__WEBPACK_IMPORTED_MODULE_1__);
        var _gen_Expression__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__("./gen/Expression.ts");
        var _Values__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__("./src/Values.ts");
        var _InterpA__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__("./src/InterpA.ts");
        var _InterpB__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__("./src/InterpB.ts");
        var _InterpC__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__("./src/InterpC.ts");
        var _InterpD__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__("./src/InterpD.ts");

        function lex(source) {
            _Lexer__WEBPACK_IMPORTED_MODULE_0__.lexer.reset(source);
            return Array.from(_Lexer__WEBPACK_IMPORTED_MODULE_0__.lexer)
        }
        class NoParseError extends Error {}

        function parse(rules, source) {
            const parses = new nearley__WEBPACK_IMPORTED_MODULE_1__.Parser(nearley__WEBPACK_IMPORTED_MODULE_1__.Grammar.fromCompiled(rules)).feed(source).finish();
            if (parses.length > 0) return parses;
            else throw new NoParseError("Syntax error at end of input: " + source)
        }
        class AmbiguousParseError extends Error {}

        function parseUnambiguous(rules, source) {
            const parses = parse(rules, source);
            if (parses.length == 1) return parses[0];
            else throw new AmbiguousParseError("input is ambiguous: " + source)
        }

        function checkParseOK(_) {
            return "parse OK"
        }
    })();
    main = __webpack_exports__
})();
//# sourceMappingURL=main.js.map
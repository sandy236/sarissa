#!/usr/bin/perl

package JSDoc;
#
# Unit testing of JSDoc
#

use strict;
use warnings;



use JSDoc;
use Data::Dumper;
use Test::More qw(no_plan);

$|++;

# parse_jsdoc_comment
diag("Testing parse_jsdoc_comment");
is_deeply(parse_jsdoc_comment(''), {summary => ''}, 
    "Ensure only summary is filled in");

is(parse_jsdoc_comment('')->{summary}, '', 'Empty comment value');


is(parse_jsdoc_comment(
        '************************* test *************')->{summary},
    'test', 'long leading and trailing stars');


# annotate_comment
diag("Testing annotate_comment");
is(annotate_comment, "\n/** \@private */", 'annotate_comment w/o arg');
like(annotate_comment("/** This is a test */"), 
        qr#^/\s*\*\*\s*This is a test\s+\@private\s*\*/\s*$#, 
        'annotate_comment w/ arg');
like(annotate_comment("/** This is a test */", '@testtag value'),
        qr#^/\s*\*\*\s*This is a test\s+\@testtag\svalue\s*\*/\s*$#, 
        'annotate_comment w/ tag argument');

# find_balanced_block
diag("Testing find_balanced_block");
my @blocks = (
        # basic simple input
        ['{', '}', '{ this is in the braces } {this is after}{{', 
            ['{ this is in the braces }', ' {this is after}{{'] ,
            'basic input'],
        
        # discard leading chars before opening char
        ['{', '}', 'discard {inner} after',
            ['{inner}', ' after'], 'discard leading chars'],

        # empty input string
        ['{', '}', '',
            ['', ''], 'empty input string'],

        # nothing to match at all
        ['{', '}', 'there is nothing to match', 
            ['', 'there is nothing to match'], 'nothing to match'],
    );
for my $test (@blocks){
    my @args = @{$test}[0..2];
    my ($expect, $explain) = @{$test}[3,4];
    is_deeply([find_balanced_block(@args)], $expect, $explain);
}


# 
# preprocess_source
#

diag("Testing preprocess_source");

# Make sure that:
#
#  Foo.prototype = { 
#     bar: function(){ return "Eep!"; },
#     baz: "Ha!"
#  } 
#
#  becomes:
#
#  Foo.prototype.bar = function(){ return "Eep!"; };
#  Foo.prototype.baz = "Ha!";

my $before = q/
  Foo.prototype = { 
     bar: function(){ return "Eep!"; },
     baz: "Ha!"
  } /;

my $after_re = qr/^\s*(?:$JSDOC_COMMENT)?\s*Foo.prototype.bar
                            \s*=\s*
                            function\(\s*\)\s*\{\s*return\s*"Eep!";\s*\};\s*
                            Foo\.prototype\.baz\s*=\s*"Ha!";\s*$/x;

like(preprocess_source($before), $after_re, 
    'Unpack prototype block assignment');

# 
# Make sure that:
#
#     /** @constructor */
#     Foo.Bar = function(){this.x = 2;var y = 3;}
# becomes:
#     /** @constructor */
#     Foo.Bar = function(){};
#     
#     /** @constructor */
#     function Foo.Bar(){}
#
#     Foo.Bar.prototype.x = 2;
#
#     /** @private */
#     Foo.Bar.prototype.y = 3;
#
$before = q#
     /** @constructor */
     Foo.Bar = function(){this.x = 2; var y = 3; }#;
$after_re = qr{
     ^\s*/\*\*\s*\@constructor\s*\*/\s*
     Foo\.Bar\s*=\s*function\s*\(\s*\)\s*\{\s*\}\s*;\s*
     /\*\*\s*\@constructor\s*\*/\s*
     function\s+Foo\.Bar\s*\(\s*\)\s*\{\s*\}
     \s* 
     Foo\.Bar\.prototype\.x\s*=\s*2\s*;\s*
     /\*\*\s*\@private\s*\*/\s*
     Foo\.Bar\.prototype\.y\s*=\s*3\s*;\s*$
    }x;
like(preprocess_source($before), $after_re,
        'Unpack nested class');

#
# Make sure that:
#       MySingleton = new function(){this.x=function(){}}
#   and
#       var MySingleton = new function(){this.x=function(){}}
# become:     
#       function MySingleton(){}
#       MySingleton.prototype.x = function(){};
#
$before = q# MySingleton = new function(){this.x=function(){}} #;
$after_re =  qr{
        ^\s*(?:$JSDOC_COMMENT)?
        \s*function\s*MySingleton\s*\(\)\s*\{\s*\}\s*
        (?:$JSDOC_COMMENT)?\s*
        MySingleton\.prototype\.x\s*=\s*function\s*\(\s*\)\s*\{\s*\}\s*;\s*$}x;
like(preprocess_source($before), $after_re,
        'Unpack singleton');

# Same thing, but with var before the declaration
$before = q#var MySingleton = new function(){this.x=function(){}} #;
like(preprocess_source($before), $after_re,
        "Unpack var'd singleton");


# 
# Test unpacking a constructor into a bunch of 
# prototype-based declarations
#

$before = q#
    /**
     * @constructor 
     */
    function MyClass(){
        /** Private variable 'x' */
        var x = 3;
        /**
         * This is my function
         */
        this.myFunction = function(){ return null; };

        /**
         * This is a private function
         */
        function myPrivateFunction(x){
            return null;
        }
    }
#;
$after_re = qr{
    /\*\*\s*
     \*\s*\@constructor\s*
     \*/\s*
    function\s+MyClass\s*\(\s*\)\s*\{\s*\}\s*
    
    /\*\*\s*Private\svariable\s'x'\s*
    \@private\s*\*/\s*
    MyClass\.prototype\.x\s*=\s*3\s*;\s*

    /\*\*\s*
    \*\s*This\sis\smy\sfunction\s*\*/\s*
    MyClass\.prototype\.myFunction\s*=\s*function\s*\(\s*\)\s*\{\s* 
        return\s+null\s*;\s*\};\s*
        
    /\*\*\s*
     \*\s*This\sis\sa\sprivate\sfunction\s*
      \@private\s*\*/\s*
    MyClass\.prototype\.myPrivateFunction\s*=\s*function\(\s*x\s*\)\s*
    \{\s*
        return\s+null\s*;\s*
    \}\s*$
}x;

like(preprocess_source($before), $after_re, 
    'Testing unpacking a constructor into prototype-based assignments');


#
# Test the marking of void methods
#
$before = q'function MyFunc(){}';
$after_re = qr{/\*\*\s*\@type\s+void\s*\*/\s*function\s+MyFunc\s*\(\)\{\}};
like(preprocess_source($before), $after_re,
   "Testing basic marking of void method without a docstring");

$before = q'
/** Method */
function MyFunc(){}
';
$after_re = qr{/\*\*\s*Method\s+\@type\s+void\s*\*/\s*
                function\s+MyFunc\(\)\{\}}x;
like(preprocess_source($before), $after_re,
    "Testing basic marking of void methods");

$before = '/** Method */
            Shape.prototype.MyFunc = function(){}';
$after_re = qr{
    /\*\*\s*
        Method\s+
        \@type\s+void\s*
    \*/\s*Shape\.prototype\.MyFunc\s*=\s*function\(\)\{\}}x;
like(preprocess_source($before), $after_re,
    "Testing marking of void anonymous method");

$before = 'Shape.prototype.MyFunc = function(){return null;}';
$after_re = qr{^\s*Shape\.prototype\.MyFunc\s*=
                \s*function\(\)\{\s*return\s+null\s*;\s*\}}x;
like(preprocess_source($before), $after_re,
    "Testing marking of void anonymous method");

$before = "function x(){return null;}";
$after_re = qr{\s*function\sx\(\)\s*\{\s*return\s+null\s*;\s*\}\s*$};
like(preprocess_source($before), $after_re,
    "Leave non-void methods without docstrings alone");

$before = "/** My test function */\nfunction x(){return null;}";
$after_re = qr{\s*/\*\*\s*My\stest\sfunction\s*\*/\s*
                function\sx\(\)\s*\{\s*return\s+null\s*;\s*\}\s*$}x;
like(preprocess_source($before), $after_re,
    "Leave non-void methods with docstrings alone");



#
# Try huge constructor input
#
my @testsrc = (q#
/**
 * @class This is class information
 * @constructor
 */
 function MyClass(){

#);
for (1..100){
    push @testsrc, "
    /**
     * THis is function number $_
     * \@return Nothing
     */
    this.func$_ = function(){if(true){if(false){return null;}}} ;\n";
}
push @testsrc, "\n}\n";
my $testsrc = join("\n", @testsrc);
# This could crash everything
preprocess_source($testsrc);
pass("Process huge constructor with preprocess_source");


#
# Huge constructor with unbalanced input
#
@testsrc = (q#
/**
 * @class This is class information
 * @constructor
 */
 function MyClass(){

#);
for (1..100){
    push @testsrc, "
    /**
     * THis is function number $_
     * \@return Nothing
     */
    this.func$_ = function(){if(true){if(false){return null;}};\n";
}
push @testsrc, "\n}\n";
$testsrc = join("\n", @testsrc);
# This could crash everything
preprocess_source($testsrc);
pass("Process huge unbalanced constructor with preprocess_source");

#
# deconstruct_mozilla_getset
#
$before = 'MyClass.prototype.__defineGetter__("myProp", function(){return null;});';
$after_re = qr{
   ^\s*MyClass\.prototype\.myProp\s*=\s*null\s*;\s*$}x;
   #\s*function\s*\(\s*\)\s*\{\s*return\s+null\s*;\s*\}\s*;\s*$}x;

like(deconstruct_getset($before), $after_re,
   "Testing behaviour of __defineGetter__");
like(preprocess_source($before), $after_re,
   "Testing behaviour of __defineGetter__ in preprocess_source");

$before = 'MyClass.prototype.__defineSetter__("myProp", function(){return null;});';
$after_re = qr{
   ^\s*MyClass\.prototype\.myProp\s*=\s*null\s*;\s*$}x;
   #\s*function\s*\(\s*\)\s*\{\s*return\s+null\s*;\s*\}\s*;\s*$}x;

like(deconstruct_getset($before), $after_re,
   "Testing behaviour of __defineSetter__");
like(preprocess_source($before), $after_re,
   "Testing behaviour of __defineSetter__ in preprocess_source");

#
# miscellaneous tests
# 
diag("Miscellaneous tests");

my $src = "
    /** \@constructor */
    function A(){}
    /** \@constructor */
    function C(){}
    /** \@constructor
    \@extends A
    */
    function B(){}
    B.prototype = new C();";

my $classes = parse_code_tree(\$src);
is($classes->{B}->{extends}, 'A', 
    "Test that the first extends marking is the good one, others are ignored");

reset_parser();
$src = "function A(){ this.n = function(){return 2};}
        var a = new A(); ";
my $classes = parse_code_tree(\$src);
ok(defined($classes->{A}), 
    "Functions are later used with 'new' must be treated as a constructor");

ok(!defined($classes->{this}), "'this' cannot be added as a class");


#!/usr/bin/perl -w

#
# This program makes use of the JSDoc module to make a JavaDoc equivalent
# for JavaScript. The template that is used is based on the JavaDoc
# doclet. This program only needs to be invoked with one or more 
# JS OO sourcefiles as command-line args.
#

use strict;
use HTML::Template;
use File::Copy;
use File::Basename;
use Getopt::Long;
use File::Find;
use lib dirname($0);
use JSDoc;
use JavaScript::Syntax::HTML qw(to_html);


use constant LOCATION           => dirname($0) . '/';
use constant MAIN_TMPL          => LOCATION . "main.tmpl";
use constant ALLCLASSES_TMPL    => LOCATION . 'allclasses-frame.tmpl';
use constant ALLCLASSES_NOFRAME_TMPL    => LOCATION . 'allclasses-noframe.tmpl';
use constant OVERVIEW_FRAME_TMPL        => LOCATION . 'overview-frame.tmpl';
use constant TREE_TMPL          => LOCATION . 'overview-tree.tmpl';
use constant OVERVIEW_TMPL      => LOCATION . 'overview-summary.tmpl';
use constant INDEX_TMPL         => LOCATION . 'index.tmpl';
use constant DEFAULT_DEST_DIR   => 'js_docs_out/';
use constant STYLESHEET         => 'stylesheet.css';
use constant HELP_TMPL          => LOCATION . 'help-doc.tmpl';
use constant INDEX_ALL_TMPL     => LOCATION . 'index-all.tmpl';
use constant CONSTANTS_TMPL     => LOCATION . 'constant-values.tmpl';

use vars qw/ $CLASSES $DEFAULT_CLASSNAME @CLASSNAMES @INDEX %TMPL_CACHE
            %CLASS_ATTRS_MAP %METHOD_ATTRS_MAP %FILE_ATTRS_MAP %OPTIONS 
            @FILENAMES %FILE_OVERVIEWS $TIME/;

#
# Begin main execution
#

&parse_cmdline;
&initialize_param_maps;
$TIME = localtime();
do '.jsdoc_config';
warn "Error parsing config file: $@\n" if $@;

my @sources;

mkdir($OPTIONS{OUTPUT})
    or die "Can't create output directory $OPTIONS{OUTPUT}: $!\n" 
    unless (-e $OPTIONS{OUTPUT} && -d $OPTIONS{OUTPUT});


if (@ARGV < 1 || $OPTIONS{HELP} || !(@sources = &load_sources())){
    warn "No sourcefiles supplied\n" if !$OPTIONS{HELP};
    &show_usage();
    exit(1);
}

# Parse the code tree
&configure_parser(GLOBALS_NAME => $OPTIONS{GLOBALS_NAME});
$CLASSES = &parse_code_tree(@sources);
%FILE_OVERVIEWS = %{delete $CLASSES->{__FILES__}};
die "Nothing to document, exiting\n" unless keys %{$CLASSES};
&output_class_templates();
&output_index_template();
&output_aux_templates();
&output_tree_template();
&_log('Completed generating documentation');

# 
# End main execution
#


#
# Output a single template
#
sub output_template {
    my ($tmplname, $outname, $params, $relaxed) = (@_);
  
    # Caching templates seems to improve performance quite a lot
    if (!$TMPL_CACHE{$tmplname}){
        $TMPL_CACHE{$tmplname} = new HTML::Template( 
            die_on_bad_params    => !$relaxed, 
            filename             => $tmplname);
    }
    my $tmpl = $TMPL_CACHE{$tmplname};
    $tmpl->param($params);
    $outname = sprintf('%s%s', $OPTIONS{OUTPUT}, mangle($outname));
    open FILE, ">$outname"
        or die "Couldn't open '$outname' to write template: $!\n";
    print FILE $tmpl->output;
    close FILE;
}

#
# Gather information for each class and output its template
#
sub output_class_templates {
  
    # Note the class name for later
    @CLASSNAMES =  sort { lc $a->{classname} cmp lc $b->{classname}} 
        map {classname => $_} ,
        grep { not defined $CLASSES->{$_}->{constructor_vars}->{private} 
                or $OPTIONS{PRIVATE} }
        keys %$CLASSES;

    my %fnames = map { 
        ($$CLASSES{$_}->{constructor_vars}->{filename} or '') => 1  
    } keys %$CLASSES; 
   
    @FILENAMES = map {filename => $_, mangledfilename => mangle($_)}, 
        sort {lc($a) cmp lc($b)} grep {length $_} keys %fnames;
    
    for (my $i = 0; $i < @CLASSNAMES; $i++){
        my $classname = $CLASSNAMES[$i]->{classname};

        # Template Parameters
        my ($class, $subclasses, $class_summary, @constructor_params, 
            $next_class, $prev_class, $constructor_attrs, $constructor_detail);

        $class= $$CLASSES{$classname};
        &add_to_index($class, $classname);

        # Set up the constructor and class information
        &resolve_synonyms($class->{constructor_vars});
        &format_vars($class->{constructor_vars});
        @constructor_params = 
            &fetch_args($class->{constructor_vars}, 
                        \$class->{constructor_args});
        $constructor_attrs = 
            &format_method_attributes($class->{constructor_vars});
        $constructor_detail = 
            &resolve_inner_links($class->{constructor_detail});
        $class_summary = &format_class_attributes($class->{constructor_vars});
        $class_summary = &resolve_inner_links($class_summary);

        # Navbar information
        $next_class = $i + 1 < @CLASSNAMES 
            ? $CLASSNAMES[$i + 1]->{classname} 
            : undef; 
        $prev_class = $i > 0 ? $CLASSNAMES[$i - 1]->{classname} : undef;

        # Find all the direct subclasses
        $subclasses = join( ',',
            map qq| <a href="$_.html">$_</a>|, 
                @{&find_subclasses($classname)});

        my $superclass = $class->{extends} || '';

        if ($$CLASSES{$superclass}){
            $superclass = "<a href='$superclass.html'>$superclass</a>" 
                unless (!$OPTIONS{PRIVATE} 
                    && $$CLASSES{$superclass}->{constructor_vars}->{private});
        }

        my $file_overview = $class->{constructor_vars}->{filename} ?
                sprintf('overview-summary-%s.html', 
                    mangle($class->{constructor_vars}->{filename}))
                : '';
        
        &output_template(MAIN_TMPL, "$classname.html", {
            next_class          => $next_class,
            prev_class          => $prev_class,
            file_overview       => $file_overview,
            superclass          => $superclass,
            constructor_args    => $class->{constructor_args},
            constructor_params  => \@constructor_params,
            constructor_attrs   => $constructor_attrs,
            constructor_returns => 
                ref($class->{constructor_vars}->{returns}[0]) eq 'ARRAY' 
                    ?  $class->{constructor_vars}->{returns}[0][0] 
                    : $class->{constructor_vars}->{returns}[0],
            class_summary       => $class_summary,
            class_attribs       => $class->{constructor_vars}->{private} ?
                                    '&lt;private&gt;' : '',
            constructor_detail  => $constructor_detail,
            constructor_summary => &get_summary($constructor_detail),
            classname           => $classname,
            subclasses          => $subclasses,
            class_tree          => &build_class_tree($classname, $CLASSES),
            fields              => &map_fields($class),
            methods             => &map_methods($class), 
            method_inheritance  => &map_method_inheritance($class),
            field_inheritance   => &map_field_inheritance($class),
            inner_classes       => $class->{inner_classes},
            project_name        => $OPTIONS{PROJECT_NAME},
            page_footer         => $OPTIONS{PAGE_FOOTER},
            ctime               => $TIME
        }, 1);
    }
}

#
# Handle cleaning up / resolving inner links in FILE_OVERVIEWS
#
sub process_file_overviews {
    for my $filename (map{$_->{filename}} @FILENAMES){
        format_vars($FILE_OVERVIEWS{$filename});
        $FILE_OVERVIEWS{$filename} = 
            resolve_inner_links($FILE_OVERVIEWS{$filename});
    }
}

#
# Output all the non-class template files
#
sub output_aux_templates(){
   
    unless ($OPTIONS{LOGO} and -f $OPTIONS{LOGO} and -r $OPTIONS{LOGO}){
        $OPTIONS{LOGO} and warn "Can't read $OPTIONS{LOGO}";
        $OPTIONS{LOGO} = '';
    }
    $OPTIONS{LOGO} and copy $OPTIONS{LOGO}, $OPTIONS{OUTPUT};

    &process_file_overviews;
  
    $DEFAULT_CLASSNAME = $CLASSNAMES[0]->{classname};
    my $summary = &get_overall_summary;

    &output_classes_frames_templates;
    &output_multiple_files_templates if @FILENAMES > 1;
    &output_index_and_help_templates($summary);
    &output_overview_summaries($summary);
    &output_const_summary();
    copy (LOCATION . STYLESHEET, $OPTIONS{OUTPUT} . STYLESHEET);
}

sub get_overall_summary {
    my $summary;
    if ($OPTIONS{PROJECT_SUMMARY}){
        if (-f $OPTIONS{PROJECT_SUMMARY} and 
                open SUMMARY, $OPTIONS{PROJECT_SUMMARY}){
            local $/ = undef;
            $summary = <SUMMARY>;
            close SUMMARY;
        } else {
            warn "Can't open $OPTIONS{PROJECT_SUMMARY}";
        }
    } elsif (@FILENAMES == 1) {
        # If we only have one file and it has an overview, use that overview
        my $filename = $FILENAMES[0]->{filename};
        if ($FILE_OVERVIEWS{$filename}->{fileoverview}){
            $summary = $FILE_OVERVIEWS{$filename}->{fileoverview}[0];
            $summary .= "<BR/><BR/>";

            while (my ($name, $val) = each %{$FILE_OVERVIEWS{$filename}}){
                $summary .= &{$FILE_ATTRS_MAP{$name}}($val)
                    if $FILE_ATTRS_MAP{$name};
            }
        }     
    }
    $summary;
}

#
# Output the main (default) page and the help template
#
sub output_index_and_help_templates {
    
    my ($summary) = @_;

    # Output the main index template
    &output_template(INDEX_TMPL, 'index.html', {  
        DEFAULT_CLASSNAME   => $summary 
                                ? 'overview-summary' 
                                : $DEFAULT_CLASSNAME,
        multifile           => @FILENAMES > 1 });

    # Output the help document template
    &output_template(HELP_TMPL, 'help-doc.html',  { 
        page_footer     => $OPTIONS{PAGE_FOOTER}, 
        ctime           => $TIME,
        project_name    => $OPTIONS{PROJECT_NAME} });

}

#
# Output the frames listing all the classes
#
sub output_classes_frames_templates {
    my $params = {    
        filename    => 'All Classes',
        fname_link  => '<a href="overview-summary.html" ' .
                        'target="classFrame">All Classes</a>',
        CLASSNAMES  => \@CLASSNAMES };
    if (@FILENAMES < 2){
        $params->{project_name} = $OPTIONS{PROJECT_NAME};
        $params->{logo} = basename($OPTIONS{LOGO});
    }
    &output_template(ALLCLASSES_TMPL, 'allclasses-frame.html', $params);

    &output_template(ALLCLASSES_NOFRAME_TMPL, 'allclasses-noframe.html', {  
        CLASSNAMES      => \@CLASSNAMES,
        project_name    => $OPTIONS{PROJECT_NAME},
        logo            => basename($OPTIONS{LOGO}) });

}

#
# Output the overview summary templates
#
sub output_overview_summaries {
    my ($summary) = @_;
    &output_template(OVERVIEW_TMPL, 'overview-summary.html', {  
        generic             => 1,
        project_name        => $OPTIONS{PROJECT_NAME},
        project_title       => $OPTIONS{PROJECT_NAME},
        page_footer         => $OPTIONS{PAGE_FOOTER},
        ctime               => $TIME,
        project_summary     => $summary,
        is_file_summary     => 0});

    for my $filename (keys %FILE_OVERVIEWS){
        my %overview = %{$FILE_OVERVIEWS{$filename}};
        my $src = delete $overview{src};
        my $summary = keys(%overview) 
            ? $overview{fileoverview}[0]
            : "No overview generated for '$filename'";
        $summary .= "<BR/><BR/>";
        while (my ($name, $val) = each %overview){
            $summary .= &{$FILE_ATTRS_MAP{$name}}($val)
                if $FILE_ATTRS_MAP{$name};
        }
        &output_template(OVERVIEW_TMPL, "overview-summary-$filename.html", {
            generic             => 0,
            sourcecode          => $OPTIONS{NO_SRC} ? '' : &to_html($src),
            project_name        => $OPTIONS{PROJECT_NAME},
            project_title       => $filename,
            page_footer         => $OPTIONS{PAGE_FOOTER},
            ctime               => $TIME,
            project_summary     => $summary,
            is_file_summary     => 1});
    }

}

#
# Output a summary page about the 'static constant' field values for all
# classes
#
sub output_const_summary {
    my @static_params;
    for my $classname (sort { uc($a) cmp uc($b) } keys %$CLASSES){
        my $class = $CLASSES->{$classname};
        my @statics = grep { $_->{field_value} =~ /^(?:\d+)|(?:(['"]).*\1)$/} 
            grep { $_->{field_vars}->{final}} @{$class->{class_fields}};
        if (@statics){
            push @static_params, {
                classname       => $classname,
                static_values   => [map { 
                    name        => $_->{field_name},
                    value       => $_->{field_value},
                    classname   => $classname}, @statics] };
        }
    }
    &output_template(CONSTANTS_TMPL, 'constant-values.html', {
        project_name        => $OPTIONS{PROJECT_NAME},
        page_footer         => $OPTIONS{PAGE_FOOTER},
        ctime               => $TIME,
        classnames          => [map {name => $_->{classname}}, @static_params],
        static_finals       => \@static_params 
    }
    ) if @static_params;
}

#
# Method to handle outputting file overview template if 
# more than one sourcefile is being processed
#
sub output_multiple_files_templates {
    &output_template(OVERVIEW_FRAME_TMPL, 'overview-frame.html', {  
        logo            => basename($OPTIONS{LOGO}),
        project_name    => $OPTIONS{PROJECT_NAME},
        filenames       => \@FILENAMES });
    
    for my $fname (map { $_->{filename}} @FILENAMES){
        my @classes = grep {
            ($$CLASSES{$_}->{constructor_vars}->{filename} || '') eq $fname
        } keys %$CLASSES;

        &output_template(ALLCLASSES_TMPL, 
            sprintf('overview-%s.html', $fname), {  
                filename    => $fname, 
                fname_link  => $FILE_OVERVIEWS{$fname} 
                                ?  sprintf('<a href="overview-summary-%s.html" 
                                        target="classFrame">%s</a>', 
                                        mangle($fname), $fname)
                                : $fname,
                CLASSNAMES  => [map {classname => $_}, sort @classes] }); 

    }
}

#
# Mangle a file path so that it can be used as a filename
#
sub mangle {
    local $_ = shift;
    tr{/\\}{_};
    $_;
}

# 
# Build the tree representation of the inheritance
# PARAM: Name of the class
#
sub build_class_tree {
    my $classname  = shift;
    my $class = $$CLASSES{$classname};
    my $tree = "";
    my @family;
    push @family, $classname;
    while ($class->{extends} and $class->{extends} ne ""){
        my $base = $class->{extends};
        if ($$CLASSES{$base}){
            $base = "<a href='$base.html'>$base</a>" 
                unless (!$OPTIONS{PRIVATE} 
                    && $$CLASSES{$base}->{constructor_vars}->{private});
        }
        push @family, $base;
        $class = $$CLASSES{$class->{extends}};
    }
    push @family, "Object";
    my $indent = 3;
    $tree = (pop @family) . "\n";
    my $name = $_;
    while ($name = pop (@family)){
        my $instr = " " x $indent;
        $tree .= sprintf "%s|\n%s+--%s%s%s\n", $instr, $instr, 
            $name eq $classname ? "<b>" : "", $name,
            $name eq $classname ? "</b>" : "";
        $indent += 6;
    }
    $tree;
}

#
# Shown if no commandline args are given
#
sub show_usage(){
    print qq{Usage: jsdoc [OPTIONS] <js sourcefiles and/or directories>+

    -h | --help         Show this message and exit
    -r | --recursive    Recurse through given directories
    -p | --private      Show private methods and fields
    -d | --directory    Specify output directory (defaults to js_docs_out)
    -q | --quiet        Suppress normal output 


    --page-footer       Specify (html) footer string that will be added to 
                        all docs
    --project-name      Specify project name for that will be added to docs 
    --logo              Specify a path to a logo to be used in the docs 
    --project-summary   Specify a path to a text file that contains an 
                        overview summary of the project 

    --no-sources        Don't include the source code view
                        
    --package-naming    Use package-style naming (i.e. keep directory names
                        in the file path). This is useful if you have multiple
                        files with the same name, but in different directories.
                        This option is only useful if --recursive is also used.

    --globals-name      Specify a 'class name' under which all unattached
                        methods will be classified. The defaults to GLOBALS
                        \n};

}

# 
# Take all the command line args as filenames and add them to @SOURCESFILES 
#
sub load_sources(){
    my (@filenames, @sources);
    for my $arg (@ARGV){
        if (-d $arg) {
            $arg =~ s/(.*[^\/])$/$1\//; 
            find( { 
                wanted => sub { 
                    push @filenames, {
                        name => $_, 
                        relname => $OPTIONS{PACKAGENAMING} 
                                ? substr($_, length($arg))
                                : (fileparse($_))[0] 
                    } if ((-f and -r and /.+\.js$/i) && 
                                (/^$arg[^\/]+$/ || $OPTIONS{RECURSIVE}))
                }, 
                no_chdir => 1 }, $arg);
        } elsif (-f $arg){
            my $relname = (fileparse($arg))[0];
            push @filenames, { name => $arg, relname => $relname };
        }   
    }
    for (@filenames){
        &_log(sprintf 'Loading sources from %s', $_->{name});
        open SRC, '<', $_->{name} 
            or (warn sprintf("Can't open %s, skipping: $!\n", $_->{name}) 
                and next);
        local $/ = undef;
        push @sources, $_->{relname};
        push @sources, \<SRC>;
        close SRC;
    }
    @sources;
}

#
# Once all sources have been parsed, finds all subclasses
# of $classname
#
sub find_subclasses(){
    my ($classname) = @_;
    my @subclasses;
    for my $class (keys %$CLASSES){
        my $subclassname = $$CLASSES{$class}->{extends};
        if ($$CLASSES{$class}->{extends} and 
	    $$CLASSES{$class}->{extends} eq $classname){
	        push @subclasses,  $class;
        }
    }
    \@subclasses;
}

#
# Make a summary of a description, cutting it off either at the first
# double newline or the first period followed by whitespace.
# PARAM: $description
#
sub get_summary {
    my ($description) = @_;
    my $summary;
    if ($description){
        ($summary) = $description =~ /^(.*?(?:[?!.](?=\s)|\n\n)).*$/gs
	    or $summary = $description;
    } else {
        $summary = "";
    }
    $summary;
}


#
# Set up all the instance and class methods for one template
# PARAM: A reference to a class
#
sub map_methods{
    my $class = shift;
    my @methods;
    for my $mtype (qw(instance_methods class_methods)){
        next unless $class->{$mtype};
        for my $method ( 
            sort {lc $a->{mapped_name} cmp lc $b->{mapped_name} }  
                    @{$class->{$mtype}}){
                &resolve_synonyms($method->{vars}); 
                next if (!$OPTIONS{PRIVATE} && $method->{vars}->{private});
                $method->{vars}->{returns}[0] = 
                    $method->{vars}->{returns}[0] || $method->{vars}->{return};
                my @args = &fetch_args($method->{vars}, \$method->{argument_list});
                @args = map { &format_vars($_); $_ } @args; 
                &format_vars($method->{vars});
                my $desc = &resolve_inner_links($method->{description});
                my $ret = ref($method->{vars}->{returns}[0]) eq 'ARRAY' 
                            ? $method->{vars}->{returns}[0][0] 
                            : $method->{vars}->{returns}[0];
                my $attrs = &format_method_attributes($method->{vars});

                push @methods, {
                    method_description  => $desc, 
                    method_summary      => &get_summary($desc),
                    method_name         => $method->{mapped_name},
                    method_arguments    => $method->{argument_list},
                    method_params       => \@args,
                    method_returns      => $ret,
                    is_class_method     => $mtype eq 'class_methods',
                    is_private          => defined($method->{vars}->{private}), 
                    attributes          => $attrs,
                    type                => &map_return_type($method) };
        }
    }
    \@methods;
}

#
# Map a function return type
#
sub map_return_type {
    my ($method) = @_;
    return 'Object' unless $method->{vars}->{type}[0];
    my $name = $method->{vars}->{type}[0];
    $name =~ s/^\s*(\S.*?)\s*$/$1/;
    return qq|<a href="$name.html">$name</a>| if $$CLASSES{$name};
    $name;
}

#
# Set up all the instance and class methods for one template
# PARAM: A reference to a class
#
sub map_fields {
    my $class = shift;
    my @fields;
    # Set up the instance fields
    for my $type (qw(instance_fields class_fields)){
        next unless $class->{$type};
        for (sort {lc $a->{field_name} cmp lc $b->{field_name} } 
                @{$class->{$type}}){
            &resolve_synonyms($_->{field_vars});
            next if (!$OPTIONS{PRIVATE} && $_->{field_vars}->{private});
            my $description = &resolve_inner_links($_->{field_description});
            my $const_link = ($_->{field_vars}->{final} &&
                    ($_->{field_value} =~ /^\-?\d+(\.\d+)?$/
                    || $_->{field_value} =~ /^(["']).*\1$/)) 
                ? $class->{classname} : '';
            push @fields, { 
                field_name          => $_->{field_name}, 
                field_description   => $description,
                field_summary       => &get_summary($description),
                is_final            => defined($_->{field_vars}->{final}),
                is_private          => defined($_->{field_vars}->{private}),
                is_class_field      => $type eq 'class_fields',
                type                => &map_field_type($_),
                const_link          => $const_link};
        }
    }
   \@fields;
}

#
# Map a field type
#
sub map_field_type {
    my ($field) = @_;
    return 'Object' unless $field->{field_vars}->{type}[0];
    my $name = $field->{field_vars}->{type}[0];
    $name =~ s/^\s*(\S.*?)\s*$/$1/;
    return qq|<a href="$name.html">$name</a>| if $$CLASSES{$name};
    $name;
}

#
# Map all the inherited methods to a template parameter
# PARAM: A reference to a class
#
sub map_method_inheritance {
    my $class = shift;
    my @method_inheritance; 
    # Set up the inherited methods
    if ($class->{inherits}){
        my $superclassname = $class->{extends};
        my $superclass = $$CLASSES{$superclassname};
        while ($superclass){
            if (!$superclass->{constructor_vars}->{private} 
                    || $OPTIONS{PRIVATE}){
                my $methods = 
                    $class->{inherits}->{$superclassname}->{instance_methods};
                push @method_inheritance, {
                    superclass_name     => $superclassname,
                    inherited_methods   => join(', ', 
                        map(qq|<a href="$superclassname.html#$_">$_</a>|, 
                            &filter_private_methods(
                                $methods, $superclassname)))} 
                                    if ($methods and @$methods);
            }
            $superclassname = $superclass->{extends};
            $superclass = $superclassname ? $$CLASSES{$superclassname} : undef;
        }
    }
    \@method_inheritance;
}

#
# Map all the inherited fields to a template parameter
# PARAM: A reference to a class
#
sub map_field_inheritance {
    my $class = shift;
    my @field_inheritance;
    # Set up the inherited fields 
    if ($class->{inherits}){
        my $superclassname = $class->{extends};
        my $superclass = $$CLASSES{$superclassname};
        while ($superclass){
            if (!$superclass->{constructor_vars}->{private} 
                    || $OPTIONS{PRIVATE}){
                my $fields = 
                    $class->{inherits}->{$superclassname}->{instance_fields};
                push @field_inheritance, {
                    superclass_name     => $superclassname,
                    inherited_fields    => join(', ', 
                        map(qq|<a href="$superclassname.html#$_">$_</a>|, 
                            &filter_private_fields($fields, $superclassname)))}
                                if ($fields and @$fields);
            }
            $superclassname = $superclass->{extends};
            $superclass = $superclassname ? $$CLASSES{$superclassname} : undef;
        }
    }
    \@field_inheritance;
}

#
# Filter out private inherited methods
#
sub filter_private_methods {
    my ($methods, $superclassname) = @_;
    my @visible_methods;
    for my $method(@$methods){
        for my $super_method 
                (@{$$CLASSES{$superclassname}->{instance_methods}}){
            push @visible_methods, $method 
                if $method eq $super_method->{mapped_name} and 
                    (!$super_method->{vars}->{private} || $OPTIONS{PRIVATE});
        }
    }
    @visible_methods;
}

#
# Filter out private inherited fields
#
sub filter_private_fields {
    my ($fields, $superclassname) = @_;
    my @visible_fields;
    for my $field (@$fields){
        for my $super_field(@{$$CLASSES{$superclassname}->{instance_fields}}){
            push @visible_fields, $field
                if $field eq $super_field->{field_name} and
                    (!$super_field->{field_vars}->{private} 
                        || $OPTIONS{PRIVATE});
        }
    }
    @visible_fields;
}

#
# Adds a class's information to the global INDEX list 
#
sub add_to_index {
    my ($class, $classname) = @_;
    push @INDEX, { 
        name    => $classname, 
        class   => $classname, 
        type    => '', linkname => '' 
    };

    if (!$class->{constructor_args}){
        $class->{constructor_args} = '';
    } else {
        push @INDEX, {
            name        => "$classname$class->{constructor_args}",
            class       => $classname,
            type        => 'Constructor in ',
            linkname    => 'constructor_detail' };
    }
    for my $mtype (qw(class_methods instance_methods)){
        my $type = sprintf('%s method in ',
            $mtype eq 'class_methods' ? 'Class' : 'Instance');
        push @INDEX, {
            name        => "$_->{mapped_name}$_->{argument_list}",
            class       => $classname,
            type        => $type,
            linkname    => $_->{mapped_name}}
                for grep {
                    not($_->{vars}->{private} and not $OPTIONS{PRIVATE})
                } @{$class->{$mtype}};

    }
    for my $ftype (qw(class_fields instance_fields)){
        my $type = sprintf('%s field in ', 
            $ftype eq 'class_fields' ? 'Class' : 'Instance');
        push @INDEX, {
            name        => $_->{field_name},
            class       => $classname,
            type        => $type,
            linkname    => $_->{field_name}}
                for grep {
                    not($_->{field_vars}->{private} and not $OPTIONS{PRIVATE})
                } @{$class->{$ftype}};
    }
}

#
# Outputs the index page
#
sub output_index_template { 
    @INDEX = sort {lc $a->{name} cmp lc $b->{name}} @INDEX;
    my %letters;
    for my $item (@INDEX){
        my $letter = uc(substr($item->{name}, 0, 1));
        $letter = uc(substr($item->{class}, 0, 1)) if $letter eq '';
        push @{$letters{$letter}}, $item; 
    }
   
    my $letter_list = [map {letter_name => $_}, 
        sort {lc $a cmp lc $b} keys %letters];
    &output_template(INDEX_ALL_TMPL, 'index-all.html', {  
        letters         => $letter_list,
        project_name    => $OPTIONS{PROJECT_NAME},
        page_footer     => $OPTIONS{PAGE_FOOTER},
        ctime           => $TIME,
        index_list      => [map {
                                letter => $_->{letter_name}, 
                                value => $letters{$_->{letter_name}}
                           }, @{$letter_list}] });
}

#
# Recursively builds up the overview tree
#
sub build_tree 
{
    my $parentclassname = shift || '';
    my $ret = "";
    for my $cname (map {$_->{classname}} @CLASSNAMES) {
        next if $cname eq $OPTIONS{GLOBALS_NAME};
        my $class = $$CLASSES{$cname};
        my $parent = $class->{extends} || '-';
        $parent = $$CLASSES{$parent} ? $parent : '-';
        my $undef_prnt = $parent ne '-' && not $$CLASSES{$parent};
        if (!($parentclassname || $parent ne '-')
                or ($parent eq $parentclassname)) {
            $ret .= qq{
                <LI TYPE="circle">
                    <A HREF="$cname.html">
                <B>$cname</B></A></LI>
            };
            my $childrentree .= &build_tree($cname);
            $ret = "$ret$childrentree" if $childrentree;
        }
    }
    $ret = "<UL>$ret</UL>" unless not $ret;
    $ret;
}

#
# Outputs the overview tree
#
sub output_tree_template {
    my $tree = &build_tree();
    &output_template(TREE_TMPL, 'overview-tree.html', {  
        classtrees      => $tree,
        project_name    => $OPTIONS{PROJECT_NAME},
        page_footer     => $OPTIONS{PAGE_FOOTER},
        ctime           => $TIME }, 1);
}

#
# Formats additional non-standard attributes for methods according to user 
# configuration
#
sub format_method_attributes {
    my ($attrs) = shift;
    my $attributes = '';
    while (my ($name, $val) = each %{$attrs}) {
        $attributes .= &{$METHOD_ATTRS_MAP{$name}}($val) 
            if $METHOD_ATTRS_MAP{$name};
    }
    $attributes;
}

#
# Formats additional non-standard attributes for classes according to user 
# configuration
#
sub format_class_attributes {
    my ($attrs) = shift;
    my $attributes;
    if ($attrs->{class} && @{ $attrs->{class} }){
        $attributes = sprintf('<BR/>%s<BR/>', $attrs->{class}[0] || '')
    }
    while (my ($name, $val) = each %{$attrs}) {
        $attributes .= &{$CLASS_ATTRS_MAP{$name}}($val) 
            if $CLASS_ATTRS_MAP{$name};
    }
    $attributes;
}

#
# Parses the command line options
#
sub parse_cmdline {
    $OPTIONS{OUTPUT} = DEFAULT_DEST_DIR;
    $OPTIONS{PROJECT_NAME} = '';
    $OPTIONS{COPYRIGHT} = '';
    $OPTIONS{PROJECT_SUMMARY} = '';
    $OPTIONS{LOGO} = '';
    $OPTIONS{GLOBALS_NAME} = 'GLOBALS';
    GetOptions(
        'private|p'         => \$OPTIONS{PRIVATE},
        'directory|d=s'     => \$OPTIONS{OUTPUT},
        'help|h'            => \$OPTIONS{HELP},
        'recursive|r'       => \$OPTIONS{RECURSIVE},
        'page-footer=s'     => \$OPTIONS{PAGE_FOOTER},
        'project-name=s'    => \$OPTIONS{PROJECT_NAME},
        'project-summary=s' => \$OPTIONS{PROJECT_SUMMARY},
        'logo=s'            => \$OPTIONS{LOGO},
        'globals-name=s'    => \$OPTIONS{GLOBALS_NAME},
        'quiet|q'           => \$OPTIONS{QUIET},
        'no-sources'        => \$OPTIONS{NO_SRC},
        'package-naming'    => \$OPTIONS{PACKAGENAMING});
    $OPTIONS{OUTPUT} =~ s/([^\/])$/$1\//;
}

#
# Resolves links for {@link } items
#
sub resolve_inner_links {
    my $doc = shift;
    $doc =~ s{\{\@link\s+([^\}]+)\}}{&format_link($1)}eg if $doc;
    return $doc;
}

#
# Formats a {@link } item
#
sub format_link {
    my ($link) = shift;
    $link =~ s/\s*(.*?)\s*/$1/;
    $link =~ s/<[^>]*>//g; 
    my ($class, $method, $label, $url); 
    my $class_re = qr/\w+(?:\.\w+)*/;
    unless ((($class, $method, $label) = 
        $link =~ /^($class_re)?#($class_re)\s*(.*)$/)
                or (($class, $label) = $link =~ /^($class_re)(?:\s+(.*))?$/)){
            if (($url, $label) = $link =~ /^(https?:\/\/\S+)\s+(.*?)\s*$/){
                return "<a href='$url'>$label</a>";
            } else {
               return $link;
            }
    }
    if ($class){
        unless ($$CLASSES{$class}){
            warn "\@link can't find reference $class\n";
            return $link;
        }
    }
    if (!$method){
        $label = $class unless $label;
        qq{<a href="$class.html#">$label</a>};
    } else {
        if ($class){
            my @methods = (@{$CLASSES->{$class}->{instance_methods}},
                           @{$CLASSES->{$class}->{class_methods}});
            my @fields = (@{$CLASSES->{$class}->{instance_fields}},
                           @{$CLASSES->{$class}->{class_fields}});
            my $ismethod = grep { $_->{mapped_name} eq $method } @methods; 
            my $isfield = grep { $_->{field_name} eq $method } @fields
                unless $ismethod;
            $label = "$class.$method" . ($ismethod ? '()' : '') unless $label;
            if ($ismethod or $isfield){
                qq{<a href="$class.html#$method">$label</a>};
            } else {
                warn "\@link can't find reference $method in $class\n";
                $link;
            }
        } else {
            $label = "$method()" unless $label;
            qq{<a href="#$method">$label</a>};
        }
    }
}


#
# Initializes the customizable maps for @attributes
#
sub initialize_param_maps {
    %CLASS_ATTRS_MAP  = (
        author =>
            sub {
                '<B>Author:</B> ' .
                    join(', ', @{$_[0]}) . "<BR/>" 
            },
        deprecated =>
            sub {
                '<B>Deprecated</B> <I>' . ($_[0] ? $_[0]->[0] : '') . 
                "</I><BR/><BR/>";
            },
        see =>
            sub {
                '<B>See:</B><UL>- ' .
                join('<BR/>- ', map {&format_link($_)} @{$_[0]}) . "</UL>"
            },
        version =>
            sub {
                '<B>Version: </B>' .
                    join(', ', @{$_[0]}) . '<BR/><BR/>' 
            },
        requires =>
            sub {
                '<B>Requires:</B><UL>- ' .
                join('<BR/>- ', map {&format_link($_)} @{$_[0]}) . "</UL>"
            },
        filename =>
            sub {
                sprintf '<I>Defined in %s</I><BR/><BR/>', 
                    sprintf("<a href='overview-summary-%s.html'>%s</a>", 
                        mangle($_[0]), $_[0]);
            },
        overviewfile => 
            sub {
                my ($content, $fh) = "";
                my $fname = $_[0][0] or return '';
                unless(open $fh, "$fname"){
                    warn "Can't open overview file '$fname' : $!\n";
                    return '';
                }
                { local $/ = undef; $content .= <$fh> }
                close $fh or warn "Couldn't close overview file '$fname'\n";
                # Crude manner to strip out extra HTML
                $content =~ s/<body>(.*)<\/body>/$1/si;
                "$content<br/>";
            }
    );
   
    %METHOD_ATTRS_MAP = (
        throws => 
            sub { 
            "<B>Throws:</B><UL>- " .  
            join("<BR>- ", @{$_[0]}) . "</UL>"
        },
    );
    $METHOD_ATTRS_MAP{exception} = $METHOD_ATTRS_MAP{throws};
    $METHOD_ATTRS_MAP{$_} = $CLASS_ATTRS_MAP{$_} for qw(author version 
                                                      deprecated see requires);
    $FILE_ATTRS_MAP{$_} = $CLASS_ATTRS_MAP{$_} for qw(author version 
                                                      see requires);
}


# 
# Parse the @param or @argument values into name/value pairs and 
# return the list of them
#
sub fetch_args {
    my ($vars, $arg_list_ref) = @_;
    return unless $vars and $$arg_list_ref;
    my (@args, %used);
    for my $arg (split /\W+/, ($$arg_list_ref =~ /\(([^)]*)/)[0]){
        for (@{$vars->{param}}){
            my ($type, $link, $name, $value) = 
                /(?:
                    \{\s*
                        (\w+(?:\.\w+)*)         # type name
                        (?:\s+(\S+)\s*)?        # optional link
                    \})?
                    \s*
                    (\w+)                       # parameter name
                    (.*)                        # description
                /x;
            next unless $name eq $arg;
            $used{$name} = 1;
            $type ||= '';
            if ($$CLASSES{$type} || $link){
                $link ||= "$type.html";
                $type =  qq|<a href="$link">$type</a>| ;
            }
            my $type_regex = qr{\b$arg\b};
            $$arg_list_ref =~ s/($type_regex)/&lt;$type&gt; $1/ if $type;
            push @args, { varname => $name, vardescrip => $value};
        }
    }
    for (@{$vars->{param}}){
        my ($type, $link, $name, $value) 
            = /(?:\{\s*(\w+(?:\.\w+)*)(?:\s+(\S+)\s*)?\})?\s*(\w+)(.*)/;
        next if $used{$name};
        push @args, { varname => $name, vardescrip => $value };
    }
    @args;
}

sub resolve_synonyms {
    my ($item) = @_;
    $item->{param} = $item->{param} || $item->{argument};
    $item->{returns} = $item->{return} || $item->{returns};
    $item->{final} = $item->{final} || $item->{const};
}

#
# Log a message to STDOUT if the --quiet switch is not used
#
sub _log {
    print $_[0], "\n" unless $OPTIONS{QUIET};
}

#
# Takes a vars hash and resolves {@link}s within it
#
sub format_vars {
    my ($vars) = @_;
    for my $key (keys %$vars){
        if (ref($vars->{$key}) eq 'ARRAY'){
            for (0..$#{$vars->{$key}}){
                $vars->{$key}->[$_] = &resolve_inner_links($vars->{$key}->[$_]);
            }
        } else {
            $vars->{$key} = &resolve_inner_links($vars->{$key});   
        }
    }
}


#!/usr/bin/perl -w
use strict;

while (<>) {
  my @f = split '\|', $_;

  my $name = $f[0];
  my $title = $f[1];
  my $type = $f[2];
  my $args = $f[3];
  my $icon = $f[4];
  my $text = $f[5];
  my $condition = $f[6];
     $condition=~ s/^\s+|\s+$//g;

  #print "$name, $type, $args\n";
  #print "$name, $title, $type, $icon, $text\n";

  if ( $condition ne '' ){

    print "\'$name\' : {\n";
    print   "  render_condition '$condition',\n";
    print   "  title: '$title',\n";
    print   "  prop: '',\n";
    print   "  type: '$type',\n";
    print   "  mv: false,\n";
    print   "  classs: '',\n";
    print   "  subclasss: '',\n";
    print   "  url_format: $args,\n";
    print   "  icon: '$icon',\n";
    print   "  text: '$text',\n";
    print "},\n\n";

  }
  elsif ( $args ne '' ){

    print "\'$name\' : {\n";
    print   "  title: '$title',\n";
    print   "  prop: '',\n";
    print   "  type: '$type',\n";
    print   "  mv: false,\n";
    print   "  classs: '',\n";
    print   "  subclasss: '',\n";
    print   "  url_format: $args,\n";
    print   "  icon: '$icon',\n";
    print   "  text: '$text',\n";
    print "},\n\n";

  }
  else {

    print "\'$name\' : {\n";
    print   "  title: '$title',\n";
    print   "  prop: '',\n";
    print   "  type: '$type',\n";
    print   "  mv: false,\n";
    print   "  classs: '',\n";
    print   "  subclasss: '',\n";
    print   "  icon: '$icon',\n";
    print   "  text: '$text',\n";
    print "},\n\n";

  }

}

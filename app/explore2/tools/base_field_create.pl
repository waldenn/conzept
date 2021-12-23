#!/usr/bin/perl -w
use strict;

while (<>) {
  my @f = split '\|', $_;

  my $name = $f[0];
  my $value = $f[1];

  #print "$name, $type, $args\n";
  #print "$name, $title, $type, $icon, $text\n";

    print "\'$name\' : {\n";
    print   "  default_value: $value,\n";
    print   "  create_condition: true,\n";
    print   "  render_condition: false,\n";
    print   "  title: '$name',\n";
    print   "  prop: '',\n";
    print   "  type: '',\n";
    print   "  mv: false,\n";
    print   "  icon: '',\n";
    print   "  text: '',\n";
    print "},\n\n";

}

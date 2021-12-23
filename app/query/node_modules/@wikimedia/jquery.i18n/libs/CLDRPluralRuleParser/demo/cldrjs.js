/*globals pluralRuleParser, jQuery, document */
(function($) {
	"use strict";

	// CLDR's json.zip has this file in supplemental folder.
	$.getJSON('../data/plurals.json', init);

	function init(plurals) {
		Cldr.load(plurals);
		$('#input-language, #input-number').on('change', changeHandler).trigger('change');
	}

	function changeHandler() {
		calculate($('#input-language').val(), $('#input-number').val());
	}

	function calculate(locale, number) {
		var pluralRules, rule, result, $resultdiv;

		pluralRules = new Cldr(locale).supplemental("plurals-type-cardinal/{language}");

		$('.result').empty();
		if (!pluralRules) {
			$('.result').append($('<div>')
				.addClass('alert alert-error')
				.text('No plural rules found')
			);
		}
		for (var ruleName in pluralRules) {
			rule = pluralRules[ruleName];
			$resultdiv = $('<div>')
				.addClass('alert alert-error')
				.html(ruleName.split('-').pop() + ': ' + rule);

			if (!result) {
				result = pluralRuleParser(rule + '', number);
				if (result) {
					$resultdiv.removeClass('alert-error').addClass('alert-success');
				}
			}

			$('.result').append($resultdiv);

		}
	}

}(jQuery));
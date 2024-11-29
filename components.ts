import van, { State } from 'vanjs-core';
import { handleForm } from "./formHandler";
import interactionMap from './interactionMap.json';

const { button, div, form, h4, i, input, label, option, select } = van.tags;

const TypeSelect = () => {
	const typeSelect = select({
		class: 'form-control',
		style: 'min-width: 100%',
		name: 'interactioner-type',
		id: 'interactioner-type'
	});

	for (const interaction of interactionMap.interactions) {
		van.add(typeSelect, option({ value: interaction.type }, interaction.type));
	}

	return typeSelect;
};

export const Interactioner = () => {
	const panelExpanded: State<boolean> = van.state<boolean>(true);

	return (
		div({ class: 'row' },
			div({ class: 'col-xs-12' },
				div({ class: 'Interactioner collapsible-section' },
					h4(
						{ class: 'collapsible', onclick: () => panelExpanded.val = !panelExpanded.val },
						i({ class: () => `fa fa-chevron-circle-${panelExpanded.val ? 'down' : 'right'}` }),
						'Interactioner'
					),
					div({ class: 'panel panel-default' },
						div(
							{
								class: () => `panel-collapse collapse ${panelExpanded.val ? 'in' : ''}`,
								role: 'tabpanel',
								ariaExpanded: panelExpanded.val
							},
							div(
								form(
									{ onsubmit: handleForm },
									div(
										{ class: 'form-group' },
										label(
											{ for: 'interactioner-type' },
											'Interaction type'
										),
										TypeSelect()
									),
									div(
										{ class: 'form-group' },
										label(
											{ for: 'interactioner-url' },
											'URL of other observation'
										),
										input(
											{
												class: 'form-control',
												id: 'interactioner-url',
												name: 'interactioner-url',
												type: 'url',
												pattern: 'https://.*\.inaturalist.org/observations/.*',
												required: true
											}
										)
									),
									button({ type: 'submit', class: 'btn btn-success' }, 'Add interaction')
								)
							)
						),
					)
				)
			)
		)
	);
};

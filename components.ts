import van, { State } from 'vanjs-core';

const { button, div, form, h4, i, input, label, option, select } = van.tags;

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
									div(
										{ class: 'form-group' },
										label(
											{ for: 'interactioner-type' },
											'Interaction type'
										),
										select(
											{ class: 'form-control', style: 'min-width: 100%' },
											option({ value: 'Visited flower of' }, 'Visited flower of'),
											option({ value: 'Eating' }, 'Eating'),
											option({ value: 'Parasitizing' }, 'Parasitizing'),
											option({ value: 'Carrying' }, 'Carrying'),
											option({ value: 'Attached to' }, 'Attached to'),
											option({ value: 'Associated with' }, 'Associated with')
										)
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
												type: 'text'
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

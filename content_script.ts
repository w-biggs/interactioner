import van, { State } from 'vanjs-core';

const { div, h4, i } = van.tags;

const Interactioner = () => {
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
								div('Test text')
							)
						),
					)
				)
			)
		)
	);
};

const styles = document.createElement('style');
styles.textContent = `
.Interactioner {
	border-top: 1px solid #DDD;
}
`;

const insert = (container: HTMLDivElement) => {
	console.log('inserting');

	document.head.appendChild(styles);
	container.insertBefore(Interactioner(), container.children[5]);

	return true;
};

const waitForRender = () => {
	const app = document.getElementById('app');

	if (!app) {
		console.error('No app found -- cannot insert Interactioner.');
		return;
	}

	const observer = new MutationObserver(() => {
		const obsSidebarContainer = document.querySelector<HTMLDivElement>('.opposite_activity');
		console.log(obsSidebarContainer);

		if (obsSidebarContainer) {
			insert(obsSidebarContainer);
			observer.disconnect();
		}
	});

	observer.observe(app, { childList: true, subtree: true });
};

waitForRender();

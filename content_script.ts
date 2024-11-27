import { Interactioner } from './components';

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

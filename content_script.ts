import { Interactioner } from './components';

const styles = document.createElement('style');
styles.textContent = `
.Interactioner {
	border-top: 1px solid #DDD;
}
`;

const insert = (container: HTMLDivElement) => {
	document.head.appendChild(styles);
	container.insertBefore(Interactioner(), container.children[5]);

	return true;
};

const waitForRender = () => {
	// check if logged in
	const apiTokenTag = document.querySelector<HTMLMetaElement>('meta[name=inaturalist-api-token]');

	if (!apiTokenTag) {
		return;
	}

	const app = document.getElementById('app');

	if (!app) {
		console.error('No app found -- cannot insert Interactioner.');
		return;
	}

	const observer = new MutationObserver(() => {
		const obsSidebarContainer = document.querySelector<HTMLDivElement>('.opposite_activity');

		if (obsSidebarContainer) {
			insert(obsSidebarContainer);
			observer.disconnect();
		}
	});

	observer.observe(app, { childList: true, subtree: true });
};

waitForRender();

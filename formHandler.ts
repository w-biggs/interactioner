import { Types } from 'inaturalits';

const getObsTaxon = async (obsId: string) => {
	const headers = {
		'Accept': 'application/json'
	};

	const response = await fetch(`https://api.inaturalist.org/v1/observations/${obsId}`, { headers });

	if (!response.ok) {
		throw new Error(`HTTP error ${response.status}`);
	}

	return response.json();
};

export const handleForm = (event: SubmitEvent) => {
	event.preventDefault();

	if (!event.target || !(event.target instanceof HTMLFormElement)) {
		return;
	}

	const isValid = event.target.reportValidity();

	if (!isValid) {
		return;
	}

	const formData = new FormData(event.target);

	const formUrl = formData.get('interactioner-url');

	if (!formUrl || formUrl instanceof File) {
		console.error('Interactioner: Got no URL from form somehow.');
		return;
	}

	const obsIdMatch = formUrl.match(/observations\/([0-9]+)/);

	if (!obsIdMatch) {
		console.error(`Interactioner: Could not extract observation ID from "${formUrl}"`);
		return;
	}

	getObsTaxon(obsIdMatch[1])
		.then((obs: Types.Observations.ObservationsShowResponse) => {
			console.log(obs);
		});
};

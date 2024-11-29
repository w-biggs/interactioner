import { Types } from 'inaturalits';
import interactionMap from './interactionMap.json';

const getObsIdFromUrl = (obsUrl: string) => {
	const obsIdMatch = obsUrl.match(/observations\/([0-9]+)/);

	if (!obsIdMatch) {
		throw new Error(`Interactioner: Could not extract observation ID from "${obsUrl}"`);
	}

	return obsIdMatch[1];
};

const getObsInfo = async (obsId: string) => {
	const response = await fetch(`https://api.inaturalist.org/v1/observations/${obsId}`);

	if (!response.ok) {
		throw new Error(`Get obs info: HTTP error ${response.status} -- ${await response.text()}`);
	}

	const responseData: Types.Observations.ObservationsShowResponse = await response.json();

	if (!responseData.results.length || !responseData.results[0]) {
		throw new Error(`No observation found for ID ${obsId}`);
	}

	return responseData.results[0];
};

const obsFieldUUID = (obs: Types.Observations.ShowObservation, fieldId: string | number): string | undefined => {
	return (obs.ofvs as any[] | undefined)?.find((obsField: any) => `${obsField.field_id}` === `${fieldId}`)?.uuid;
};

const getAPIToken = () => {
	const apiTokenTag = document.querySelector<HTMLMetaElement>('meta[name=inaturalist-api-token]');

	if (!apiTokenTag) {
		throw new Error('No API meta element found.');
	}

	return apiTokenTag.content;
};

const addInteractionById = async (obsId: string, fieldId: string | number, value: string | number, uuid: string | undefined) => {
	const requestURL = `https://api.inaturalist.org/v1/observation_field_values/${uuid ?? ''}`;
	const requestOptions = {
		method: uuid ? 'PUT' : 'POST',
		body: JSON.stringify({
			observation_field_value: {
				observation_id: obsId,
				observation_field_id: fieldId,
				value
			}
		}),
		headers: {
			'Authorization': getAPIToken()
		}
	};

	const response = await fetch(requestURL, requestOptions);

	if (!response.ok) {
		throw new Error(`Add interaction by ID: HTTP error ${response.status} -- ${await response.text()}`);
	}

	return;
};

const addInteractions = async (toObsUrl: string, interaction: string) => {
	const fromObsId = getObsIdFromUrl(window.location.href);
	const toObsId = getObsIdFromUrl(toObsUrl);

	// map interaction to IDs
	const interactionObj = interactionMap.interactions.find(
		(intObj) => intObj.type === interaction
	);

	if (!interactionObj) {
		throw new Error(`Could not find matching interaction map object for value ${interaction}`);
	}

	const toObs = await getObsInfo(toObsId);
	const fromObs = await getObsInfo(fromObsId);

	await addInteractionById(
		fromObsId,
		interactionObj.fromLinkedFieldId,
		toObsUrl,
		obsFieldUUID(fromObs, interactionObj.fromLinkedFieldId)
	);
	if (toObs.taxon?.id) {
		await addInteractionById(
			fromObsId,
			interactionObj.fromTaxonFieldId,
			toObs.taxon.id,
			obsFieldUUID(fromObs, interactionObj.fromTaxonFieldId)
		);
	}

	await addInteractionById(
		toObsId,
		interactionObj.toLinkedFieldId,
		toObsUrl,
		obsFieldUUID(toObs, interactionObj.toLinkedFieldId)
	);
	if (fromObs.taxon?.id && interactionObj.toTaxonFieldId) {
		await addInteractionById(
			toObsId,
			interactionObj.toTaxonFieldId,
			fromObs.taxon.id,
			obsFieldUUID(toObs, interactionObj.toTaxonFieldId)
		);
	}

	window.location.reload();
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
	const formObsType = formData.get('interactioner-type');

	if (!formUrl || formUrl instanceof File) {
		throw new Error('Got no URL from form.');
	}
	if (!formObsType || formObsType instanceof File) {
		throw new Error('Got no observation type from form.');
	}

	return addInteractions(formUrl, formObsType);
};

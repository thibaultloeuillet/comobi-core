// @ts-check
import React from 'react'
import htm from 'htm'
import styled from 'styled-components'
import TripProposal from './TripProposal'
import { getAdditionnalTimeByTrip, getRelevantTrip }  from '../../server/findRelevantTripProposals.js'
// @ts-ignore
import config from '../../_config.yml'

const html = htm.bind(React.createElement)

// TODO : and other status ?
import {
	STATUS_PENDING,
	STATUS_ERROR,
	STATUS_VALUE
} from '../asyncStatusHelpers'

export default function DriversList({
	tripProposalsByTrip,
	tripRequestAsyncStatus,
	validTripRequest,
	tripRequest,
	positionByPlace
}) {
	let orderedTrips;
	if (!validTripRequest){
		return html`
			<div style=${{ textAlign: 'center', marginTop: '2rem' }}>
				<p style=${{ marginBottom: '0rem' }}>
					${tripProposalsByTrip.size} trajets disponibles sur ${config.nom}
				</p>
				<a href="${config.formulaire}"
					>J'ai une voiture et je veux aider</a
				>
			</div>
		`
	} else {
		orderedTrips = getAdditionnalTimeByTrip(tripRequest, tripProposalsByTrip, positionByPlace);
		const directTripList = getRelevantTrip(tripProposalsByTrip, orderedTrips, time => time < 5),
			trip10List = getRelevantTrip(tripProposalsByTrip, orderedTrips, time => time >= 5 && time < 20),
			trip20List = getRelevantTrip(tripProposalsByTrip, orderedTrips, time => time >= 20 && time < 45);

		const hasNoTrip = directTripList === undefined && trip10List === undefined && trip20List === undefined;

		let directTripElementList, trip10ElementList, trips20ElementList;
		if (!hasNoTrip) {
			directTripElementList = directTripList !== undefined && displayTripList(1, tripRequest, directTripList),
				trip10ElementList = trip10List !== undefined && displayTripList(2, tripRequest, trip10List),
				trips20ElementList = trip20List !== undefined && displayTripList(3, tripRequest, trip20List);
		}
		
		
		
		return html`
			<${styled.div`
				h2,
				h3 {
					margin-top: 1rem;
					text-align: center;
				}
				ul {
					margin: 0 auto;
					max-width: 30rem;
					margin-bottom: 3rem;
				}

					> small {
						text-align: center;
						display: block;
						margin-bottom: 1.6rem;
					}

				em {
					background: yellow;
					font-style: normal;
				}
			`}>
				<h2 key="direct">${
					tripRequestAsyncStatus === STATUS_PENDING
						? `(recherche en cours)`
						: hasNoTrip
						? `(aucun résultat)`
						: `Trajets disponibles`
				}</h2>
				${directTripElementList}
				${(trip10ElementList || trips20ElementList) &&
					html`
						<h3 key="indirect">Trajets indirects</h3>
					`}
				${trip10ElementList &&
					html`
						<small key="10">
							Un <em>détour de plus de 5 minutes</em> sera nécessaire pour vousrécupérer :</small>
						${trip10ElementList}
					`}
				${trips20ElementList &&
					html`
						<small key="20">
							Un <em>détour conséquent (entre 20 et 45 minutes)</em> sera nécessaire pour vous récupérer :</small>
						${trips20ElementList}
					`}
			</div>
		`
	}
}
/**
 * 
 * @param {number} keyElement 
 * @param {TripProposal[]} tripListToDisplay 
 * @param {Trip} tripRequest 
 * @return
 */
const displayTripList = (keyElement, tripRequest, tripListToDisplay) => {
	let tripTagElementList = tripListToDisplay
		.map((tripProposal, i) => {
			const key = `${tripRequest.origin}${keyElement+i}`;
			return html`
				<${TripProposal}
					tripKey=${key}
					tripProposal=${tripProposal}
					tripRequest=${tripRequest}
				/>
			`
			})
	return tripTagElementList.length === 0 ? undefined :
		html`
			<ul key=${keyElement} className="drivers-list">
				${tripTagElementList}
			</ul>
		`
}

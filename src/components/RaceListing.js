import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import moment from 'moment';
import { clone, intersection } from 'lodash';

import allRaces from '../lib/races';
import LicenceLevel from './LicenceLevel';

const sortRaces = (rules, unordered) => {
  const races = clone(unordered);
  races.sort((a, b) => {
    for (let rule of rules) {
      if (a[rule.key] === b[rule.key]) {
        continue;
      }
      if (rule.order === 'asc') {
        return a[rule.key] < b[rule.key] ? -1 : 1;
      }
      if (rule.order === 'desc') {
        return a[rule.key] > b[rule.key] ? -1 : 1;
      }
    }
    return 0;
  });
  return races;
}

export default class RaceListing extends Component {
  static propTypes = {
    time: PropTypes.number,
    sort: PropTypes.array,
    filters: PropTypes.object,
    favouriteSeries: PropTypes.array,
    ownedTracks: PropTypes.array,
    ownedCars: PropTypes.array
  }

  static defaultProps = {
    time: Math.round(moment().format('x')),
    sort: [{key: 'licenceLevel', order: 'asc'}, {key: 'series', order: 'asc'}],
    filters: [],
    favouriteSeries: [],
    ownedTracks: [],
    ownedCars: [],
  }

  render() {
    const { time, sort, filters, favouriteSeries, ownedTracks, ownedCars } = this.props;
    let races = allRaces.filter((race) => {
      return race.startTime < time && time < (race.startTime + race.weekLength);
    });

    races = sortRaces(sort, races);

    races = races.filter((race) => {
      return filters.type.indexOf(race.type) !== -1;
    });

    races = races.filter((race) => {
      return filters.licence.indexOf(race.licenceClass) !== -1;
    });

    races = races.filter((race) => {
      return filters.fixed.indexOf(race.fixed) !== -1;
    });

    races = races.filter((race) => {
      return filters.official.indexOf(race.official) !== -1;
    });

    if (filters.favouriteSeries) {
      races = races.filter((race) => {
        return favouriteSeries.indexOf(race.seriesId) !== -1;
      });
    }

    if (filters.ownedTracks) {
      races = races.filter((race) => {
        return ownedTracks.indexOf(race.trackId) !== -1;
      });
    }

    if (filters.ownedCars) {
      races = races.filter((race) => {
        return intersection(ownedCars, race.carIds).length !== 0;
      });
    }

    return (
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Licence</th>
              <th>Type</th>
              <th>Series</th>
              <th>Track</th>
              <th>Car</th>
              <th>Start</th>
              <th>End</th>
              <th>Official</th>
              <th>Fixed</th>
            </tr>
          </thead>
          <tbody>
            {races.map((race, index) => (
              <tr key={index}>
                <td><LicenceLevel licence={race.licenceLevel} /></td>
                <td>{race.type}</td>
                <td>
                  {favouriteSeries.indexOf(race.seriesId) !== -1 ? (
                    <span className="glyphicon glyphicon-star" />
                  ) : null}
                  <span> </span>{race.series}
                </td>
                <td className={classnames({success: ownedTracks.indexOf(race.trackId) !== -1})}>
                  {race.track}
                </td>
                <td className={classnames({success: intersection(ownedCars, race.carIds).length !== 0})}>
                  {race.carClasses.join(', ')}
                </td>
                <td>{moment(race.startTime, 'x').format('YYYY-MM-DD')}</td>
                <td>{
                  moment(race.startTime + race.weekLength, 'x').subtract(1, 'days').format('YYYY-MM-DD')
                }</td>
                <td>{race.official && <span className="glyphicon glyphicon-ok" />}</td>
                <td>{race.fixed && <span className="glyphicon glyphicon-ok" />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}
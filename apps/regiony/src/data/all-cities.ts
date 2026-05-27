// Импортирует данные районов и repairTypes из 17 непомещающихся в CF городов
// и создаёт единую коллекцию для генерации страниц.

import { districts as izhDistricts, repairTypes as izhTypes } from '../../../izh/src/data/districts';
import { districts as irkDistricts, repairTypes as irkTypes } from '../../../irk/src/data/districts';
import { districts as khvDistricts, repairTypes as khvTypes } from '../../../khv/src/data/districts';
import { districts as vvoDistricts, repairTypes as vvoTypes } from '../../../vvo/src/data/districts';
import { districts as kemDistricts, repairTypes as kemTypes } from '../../../kem/src/data/districts';
import { districts as tltDistricts, repairTypes as tltTypes } from '../../../tlt/src/data/districts';
import { districts as sarDistricts, repairTypes as sarTypes } from '../../../sar/src/data/districts';
import { districts as orenDistricts, repairTypes as orenTypes } from '../../../oren/src/data/districts';
import { districts as tulDistricts, repairTypes as tulTypes } from '../../../tul/src/data/districts';
import { districts as yarDistricts, repairTypes as yarTypes } from '../../../yar/src/data/districts';
import { districts as rznDistricts, repairTypes as rznTypes } from '../../../rzn/src/data/districts';
import { districts as astrDistricts, repairTypes as astrTypes } from '../../../astr/src/data/districts';
import { districts as pnzDistricts, repairTypes as pnzTypes } from '../../../pnz/src/data/districts';
import { districts as lpkDistricts, repairTypes as lpkTypes } from '../../../lpk/src/data/districts';
import { districts as kirDistricts, repairTypes as kirTypes } from '../../../kir/src/data/districts';
import { districts as cbxDistricts, repairTypes as cbxTypes } from '../../../cbx/src/data/districts';
import { districts as kldDistricts, repairTypes as kldTypes } from '../../../kld/src/data/districts';

export interface RepairType {
  key: 'cosmetic' | 'capital' | 'euro' | 'designer';
  name: string;
  ruShort: string;
  pricePerSqM: number;
  description: string;
  includes: string[];
  durationDays: string;
}

export interface District {
  slug: string;
  name: string;
  shortName: string;
  intro: string;
  housingProfile: string;
  priceMultiplier: number;
  uniqueFactors: string[];
  examples: { type: string; price: string; details: string }[];
  topMetroStations: string[];
}

export interface City {
  slug: string;
  cityName: string;
  cityNameGen: string;
  color: string;
  bgLight: string;
  bgVeryLight: string;
  emoji: string;
  geo: { lat: number; lon: number; regionCode: string };
  districts: District[];
  repairTypes: RepairType[];
}

export const cities: City[] = [
  { slug: 'izh', cityName: 'Ижевск', cityNameGen: 'Ижевска', color: '#3a6b3a', bgLight: '#dfeadf', bgVeryLight: '#ecf2ec', emoji: '🌲',
    geo: { lat: 56.8527, lon: 53.2115, regionCode: 'RU-UD' }, districts: izhDistricts, repairTypes: izhTypes },
  { slug: 'irk', cityName: 'Иркутск', cityNameGen: 'Иркутска', color: '#3a5a8a', bgLight: '#dfe5f0', bgVeryLight: '#ecf0f7', emoji: '🌊',
    geo: { lat: 52.2870, lon: 104.3050, regionCode: 'RU-IRK' }, districts: irkDistricts, repairTypes: irkTypes },
  { slug: 'khv', cityName: 'Хабаровск', cityNameGen: 'Хабаровска', color: '#1a8770', bgLight: '#dff0eb', bgVeryLight: '#ecf7f3', emoji: '🌊',
    geo: { lat: 48.4814, lon: 135.0721, regionCode: 'RU-KHA' }, districts: khvDistricts, repairTypes: khvTypes },
  { slug: 'vvo', cityName: 'Владивосток', cityNameGen: 'Владивостока', color: '#1a4d7a', bgLight: '#dce8f0', bgVeryLight: '#ecf2f7', emoji: '🌊',
    geo: { lat: 43.1198, lon: 131.8869, regionCode: 'RU-PRI' }, districts: vvoDistricts, repairTypes: vvoTypes },
  { slug: 'kem', cityName: 'Кемерово', cityNameGen: 'Кемерово', color: '#5a3a1a', bgLight: '#ede2d5', bgVeryLight: '#f6efe7', emoji: '⚒',
    geo: { lat: 55.3331, lon: 86.0833, regionCode: 'RU-KEM' }, districts: kemDistricts, repairTypes: kemTypes },
  { slug: 'tlt', cityName: 'Тольятти', cityNameGen: 'Тольятти', color: '#3a5fcd', bgLight: '#e4ebfa', bgVeryLight: '#eef2fc', emoji: '🚗',
    geo: { lat: 53.5303, lon: 49.3461, regionCode: 'RU-SAM' }, districts: tltDistricts, repairTypes: tltTypes },
  { slug: 'sar', cityName: 'Саратов', cityNameGen: 'Саратова', color: '#a8323a', bgLight: '#fae0e2', bgVeryLight: '#fdedee', emoji: '🌉',
    geo: { lat: 51.5924, lon: 46.0348, regionCode: 'RU-SAR' }, districts: sarDistricts, repairTypes: sarTypes },
  { slug: 'oren', cityName: 'Оренбург', cityNameGen: 'Оренбурга', color: '#9c5a3a', bgLight: '#f5e0d5', bgVeryLight: '#faece5', emoji: '🌅',
    geo: { lat: 51.7727, lon: 55.0988, regionCode: 'RU-ORE' }, districts: orenDistricts, repairTypes: orenTypes },
  { slug: 'tul', cityName: 'Тула', cityNameGen: 'Тулы', color: '#5a4a3a', bgLight: '#eee5db', bgVeryLight: '#f6f0e8', emoji: '⚒',
    geo: { lat: 54.1961, lon: 37.6182, regionCode: 'RU-TUL' }, districts: tulDistricts, repairTypes: tulTypes },
  { slug: 'yar', cityName: 'Ярославль', cityNameGen: 'Ярославля', color: '#5d3fd3', bgLight: '#ede8fb', bgVeryLight: '#f5f2fd', emoji: '🏛',
    geo: { lat: 57.6261, lon: 39.8845, regionCode: 'RU-YAR' }, districts: yarDistricts, repairTypes: yarTypes },
  { slug: 'rzn', cityName: 'Рязань', cityNameGen: 'Рязани', color: '#3a8a5a', bgLight: '#dfeee5', bgVeryLight: '#ecf6f0', emoji: '🌳',
    geo: { lat: 54.6094, lon: 39.7126, regionCode: 'RU-RYA' }, districts: rznDistricts, repairTypes: rznTypes },
  { slug: 'astr', cityName: 'Астрахань', cityNameGen: 'Астрахани', color: '#d4761a', bgLight: '#fdf0e0', bgVeryLight: '#fef7eb', emoji: '🐟',
    geo: { lat: 46.3479, lon: 48.0336, regionCode: 'RU-AST' }, districts: astrDistricts, repairTypes: astrTypes },
  { slug: 'pnz', cityName: 'Пенза', cityNameGen: 'Пензы', color: '#7a5230', bgLight: '#f0e7da', bgVeryLight: '#f8f2ea', emoji: '🌳',
    geo: { lat: 53.1959, lon: 45.0046, regionCode: 'RU-PNZ' }, districts: pnzDistricts, repairTypes: pnzTypes },
  { slug: 'lpk', cityName: 'Липецк', cityNameGen: 'Липецка', color: '#4a7a3a', bgLight: '#e2eedd', bgVeryLight: '#eef5eb', emoji: '⚒',
    geo: { lat: 52.6088, lon: 39.5992, regionCode: 'RU-LIP' }, districts: lpkDistricts, repairTypes: lpkTypes },
  { slug: 'kir', cityName: 'Киров', cityNameGen: 'Кирова', color: '#3a6b8a', bgLight: '#dfe9f2', bgVeryLight: '#ecf2f8', emoji: '🌲',
    geo: { lat: 58.6035, lon: 49.6679, regionCode: 'RU-KIR' }, districts: kirDistricts, repairTypes: kirTypes },
  { slug: 'cbx', cityName: 'Чебоксары', cityNameGen: 'Чебоксар', color: '#1a8755', bgLight: '#dff0e7', bgVeryLight: '#ecf7f1', emoji: '🌳',
    geo: { lat: 56.1438, lon: 47.2515, regionCode: 'RU-CU' }, districts: cbxDistricts, repairTypes: cbxTypes },
  { slug: 'kld', cityName: 'Калининград', cityNameGen: 'Калининграда', color: '#1a4d7a', bgLight: '#dce8f0', bgVeryLight: '#ecf2f7', emoji: '⛪',
    geo: { lat: 54.7104, lon: 20.4522, regionCode: 'RU-KGD' }, districts: kldDistricts, repairTypes: kldTypes }
];

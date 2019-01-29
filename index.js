'use strict';

const fetch = require('node-fetch');
const chalk = require('chalk');

const store = {
	modem: {
		provider: '',
		network: '',
		level: 0,
		maxLevel: 5,
		strength: 0,
	},
	battery: {
		level: 0,
		maxLevel: 5,
		charging: 0,
		capacity: 0,
	},
	system: {
		date: '',
		uptime: 0,
	},
	sms: {
		store: 0,
		new: 0,
	},
	ipv4: {
		status: 'Disconnected',
		provider: '',
		ip: '',
	},
	ipv6: {
		status: 'Disconnected',
		provider: '',
		ip: '',
	},
};

const render = function() {
	console.log('\x1Bc');

	console.log(chalk`{underline {bold SYSTEM}}
{bold Time} ${store.system.date}
{bold Uptime} ${store.system.uptime}s
`);

	let modemLevel = chalk`{bold [}`;
	for (let i = 0; i < store.modem.maxLevel; i++) {
		if (i < store.modem.level) {
			modemLevel += chalk`{green |}`;
		} else {
			modemLevel += ' ';
		}
	}
	modemLevel += chalk`{bold ]}`;

	console.log(chalk`{underline {bold MODEM}} ${modemLevel} ${store.modem.strength}dB
{bold Provider} ${store.modem.provider}
{bold Network} ${store.modem.network}
`);

	let batteryLevel = '';
	if (store.battery.charging) {
		batteryLevel += chalk`{green {bold [}}`;
	} else {
		batteryLevel += chalk`{bold [}`;
	}
	for (let i = 0; i < store.battery.maxLevel; i++) {
		if (i < store.battery.level) {
			batteryLevel += chalk`{green |}`;
		} else {
			batteryLevel += ' ';
		}
	}
	if (store.battery.charging) {
		batteryLevel += chalk`{green {bold ]}}`;
	} else {
		batteryLevel += chalk`{bold ]}`;
	}

	console.log(chalk`{underline {bold BATTERY}} ${batteryLevel} ${store.battery.capacity}%`);

	console.log(chalk`
{underline {bold SMS}}
{bold Store} ${store.sms.store}
{bold New} ${store.sms.new}
`);

	console.log(chalk`{underline {bold IPv4}} ${store.ipv4.status}
{bold Provider} ${store.ipv4.provider}
{bold IP} ${store.ipv4.ip}
`);

	console.log(chalk`{underline {bold IPv6}} ${store.ipv6.status}
{bold Provider} ${store.ipv6.provider}
{bold IP} ${store.ipv6.ip}`);
};

const wait = function() {
	return new Promise(function(resolve) {
		setTimeout(() => resolve(), 5000);
	});
};

const makeRequest = function() {
	return fetch( 'http://192.168.0.1/data.ria?DynUpdate=up_5s' )
		.then(res => res.json())
		.then((data = {}) => {
			// Update ipv4
			const {ipv4 = {
				status: 'Disconnected',
				op_name: '',
				ip: '',
			}} = data;

			store.ipv4 = {
				status: ipv4.status || 'Disconnected',
				provider: ipv4.op_name || '',
				ip: ipv4.ip || '',
			};

			// Update ipv6
			const {ipv6 = {
				status: 'Disconnected',
				op_name: '',
				ip: '',
			}} = data;

			store.ipv6 = {
				status: ipv6.status || 'Disconnected',
				provider: ipv6.op_name || '',
				ip: ipv6.ip || '',
			};

			// Update modem
			const {signal = {}} = data;
			const {modem = {
				spn: '',
				service: '',
				level: 0,
				max_level: 5,
				strength: 0,
			}} = signal;

			store.modem = {
				provider: modem.spn || '',
				network: modem.service || '',
				level: modem.level || 0,
				maxLevel: modem.max_level || 5,
				strength: modem.strength || 0,
			};

			// Update battery
			const {battery = {
				level: 0,
				charging: 0,
				capacity: 0,
			}} = data;

			store.battery = {
				level: battery.level || 0,
				maxLevel: 5,
				charging: battery.charging || 0,
				capacity: battery.capacity || 0,
			};

			// Update system
			const {system_date = '', system_uptime = 0} = data;

			store.system.date = system_date;
			store.system.uptime = system_uptime;

			// Update SMS
			const {sms_store = 0, new_sms = 0} = data;

			store.sms.store = sms_store;
			store.sms.new = new_sms;
		})
		.then(() => render())
		.catch(error => console.error(error))
		.then(() => wait())
		.then(() => makeRequest());
};

render();
makeRequest();

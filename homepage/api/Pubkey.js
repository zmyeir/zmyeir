const app = require('express')();

app.get('/ssh', (req, res) => {
  const ssh = `
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOr+W10B5UzTScG6Jl8l4oQnQioRXmdyZcIESgu94ccK
  `;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.end(`${ssh}`);
});

app.get('/gpg', (req, res) => {
  const gpg = `
-----BEGIN PGP PUBLIC KEY BLOCK-----

mDMEYTPccRYJKwYBBAHaRw8BAQdAPg4Y8Ku7IpZfKB8tijgu7Jx8uiIJDtTsI6B+
8AqY8520FFpteWVpciA8aUB6cmxhYi5vcmc+iJMEExYKADsWIQTQTk8KLgaBCDsS
IIb2b/Zv9m/2bwUCYTPccQIbAQULCQgHAgIiAgYVCgkICwIEFgIDAQIeBwIXgAAK
CRD2b/Zv9m/2b/GJAQCrn7+c3Och9CsI06+HwIgvTjwE8/I0VVdyTQLtvxbWdQD/
ewpdi4jXwPRXxA9mKAfzXV8zCyiljmHFr54XYF/sGAy0FVpteWVpciA8enJAenJs
YWIub3JnPoiWBBMWCgA+AhsBBQsJCAcCAiICBhUKCQgLAgQWAgMBAh4HAheAFiEE
0E5PCi4GgQg7EiCG9m/2b/Zv9m8FAmPGdmcCGQEACgkQ9m/2b/Zv9m/Y7QEArTU6
6ZncjCTuAXlhGgqDeFUwqBzG7hiTRztOB3jS748BAJTjl4anDbswdsNKkC1/1NHj
T/ocEhxlNgl7Fg8xlXMJtBlabXllaXIgPHpteWVpckBnbWFpbC5jb20+iJMEExYK
ADsWIQTQTk8KLgaBCDsSIIb2b/Zv9m/2bwUCY8Z1BgIbAQULCQgHAgIiAgYVCgkI
CwIEFgIDAQIeBwIXgAAKCRD2b/Zv9m/2b4hVAQCAfVxckSsCqUyzt56fF6dinRCn
ImiM1ahG0tZ8sy9JCgD/RI89eV/j9JkoJae/68hnU+aaNZpH9b4PoKC4a7+bqw+4
OARhf1pmEgorBgEEAZdVAQUBAQdASIENTw+JaNNaUX/IAfaUnvz+nrq4eERhjIYf
6s3Br1ADAQgHiHgEGBYKACAWIQTQTk8KLgaBCDsSIIb2b/Zv9m/2bwUCYX9aZgIb
DAAKCRD2b/Zv9m/2byBCAQDc61CHmwFxFj1QRS8WvJbh9JJeip61PYk34QZDFzHE
1wEAtmjQVCpXsVtSMiElrs1p9H2hAVnFEnxClNn1k+YGTQC4MwRiKb/vFgkrBgEE
AdpHDwEBB0AbVv4bXoKk2g0lZzVEsjZY4ZaDF5M7kVPzE6OAh8zkIojvBBgWCgAg
FiEE0E5PCi4GgQg7EiCG9m/2b/Zv9m8FAmIpv+8CGwIAgQkQ9m/2b/Zv9m92IAQZ
FgoAHRYhBKDgm0+9L28rS4WFXMn/////////BQJiKb/vAAoJEMn/////////SwMB
ANd7K5scuLUvMbimwA5Dm5Nmb2sG3iOoxEwMSucliLcIAQChS1hHxdQlnm+ASfQ2
ot5YaSI66v+ZKHP2C/rYPIT0BJlOAP0fF2BtbkRbcs4nVdAwybZizOp2GOJTJZpW
/+2Iz/DI4AEAxjsSQTiK0qZiD4ICcwjyhZdw8VS3Z/K0RauySK4uZA64MwRitUUH
FgkrBgEEAdpHDwEBB0Bn7TaO24h3hfmk0apRDwBbjy2tdGTtCEmFkpnxDHlCXYh4
BBgWCgAgFiEE0E5PCi4GgQg7EiCG9m/2b/Zv9m8FAmK1RQcCGyAACgkQ9m/2b/Zv
9m/HpgEAvFvBIAHDkJUZHAWCUYucUos4uLNHCb6QlzH6kXcb13oBAIFjLE32QAeo
UXGBfl/XtcuzM1oj5nUxES/GI4/obA4O
=hBzR
-----END PGP PUBLIC KEY BLOCK-----
  `;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
  res.end(`${gpg}`);
});

module.exports = app;
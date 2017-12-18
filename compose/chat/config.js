var env = process.env;
var fs = require('fs');

var cfg = {
  "SIGNAL_URL": env.SIGNAL_URL || "ws://localhost:3000",
};

fs.writeFileSync('/dist/app/common/services/configuration.json', JSON.stringify(cfg));

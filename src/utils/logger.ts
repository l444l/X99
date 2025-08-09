import pino from "pino";
import pretty from "pino-pretty";
import _ from "lodash";

const stream = pretty({
  colorize: true,
  translateTime: "HH:MM:ss",
  ignore: "pid,hostname",
  singleLine: false,
});

const base = pino(
  {
    level: "debug",
    base: null,
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  stream,
);

function format(args: any[]) {
  if (args.length === 1) return args[0];
  return args.map((arg) => (_.isObject(arg) ? arg : { value: arg }));
}

export const logger = {
  info: (...args: any[]) => base.info(format(args)),
  warn: (...args: any[]) => base.warn(format(args)),
  error: (...args: any[]) => base.error(format(args)),
  debug: (...args: any[]) => base.debug(format(args)),
  success: (...args: any[]) =>
    base.info({ status: "success", data: format(args) }),
};

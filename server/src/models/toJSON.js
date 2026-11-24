const applyToJSON = (schema, extra) => {
  schema.set('toJSON', {
    transform: (doc, ret) => {
      ret.id = String(ret._id);
      delete ret._id;
      delete ret.__v;
      return extra ? extra(ret) : ret;
    },
  });
};

module.exports = applyToJSON;

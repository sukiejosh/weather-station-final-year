import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';
import { IStation, IStationDoc, IStationModel } from './station.interface';

const stationSchema = new mongoose.Schema<IStationDoc, IStationModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    identifier: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

//@ts-ignore
stationSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
stationSchema.static('isNameTaken', async function (name: string, owner: mongoose.ObjectId): Promise<boolean> {
  const user = await this.findOne({ name, owner });
  return !!user;
});

const Station = mongoose.model<IStation, IStationModel>('Station', stationSchema);

export default Station;

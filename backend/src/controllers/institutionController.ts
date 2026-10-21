import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { memoryStore } from '../services/db.js';

export const institutionController = {
  /**
   * List verified blood banks and hospitals with live inventory
   */
  async getInstitutions(req: AuthenticatedRequest, res: Response) {
    try {
      const { type, city, bloodGroup } = req.query;

      let list = [...memoryStore.bloodBanksHospitals];

      if (type) {
        list = list.filter(i => i.type === type);
      }
      if (city) {
        list = list.filter(i => i.city.toLowerCase().includes((city as string).toLowerCase()));
      }
      if (bloodGroup) {
        list = list.filter(i => {
          const inv = i.availableInventory as Record<string, number> | undefined;
          return inv && (inv[bloodGroup as string] || 0) > 0;
        });
      }

      return res.status(200).json({
        status: 'success',
        count: list.length,
        data: list,
      });
    } catch (err: any) {
      return res.status(500).json({ status: 'error', message: 'Failed to retrieve institutions.' });
    }
  },

  /**
   * Get single institution by ID
   */
  async getInstitutionById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const item = memoryStore.bloodBanksHospitals.find(i => i.id === id);

    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Institution not found.' });
    }

    return res.status(200).json({
      status: 'success',
      data: item,
    });
  }
};

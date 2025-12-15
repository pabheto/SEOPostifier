import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { License } from '../users/schemas/license.schema';

@Injectable()
export class LicensesService {
  constructor(
    @InjectModel(License.name) private licenseModel: Model<License>,
  ) {}

  async getLicensesForUser(userId: string) {
    const licenses = await this.licenseModel.find({ userId }).exec();
    return licenses.map((license) => ({
      id: license._id,
      key: license.key,
      name: license.name,
      activated: license.activated || false,
      activatedForSite: license.activatedForSite || null,
      activatedAt: license.activatedAt || null,
    }));
  }

  async createLicenseForUser(userId: string, name: string) {
    const licenseKey = this.generateLicenseKey();
    const license = await this.licenseModel.create({
      userId,
      name,
      key: licenseKey,
      activated: false,
    });
    return {
      id: license._id,
      key: license.key,
      name: license.name,
      activated: license.activated || false,
      activatedForSite: license.activatedForSite || null,
      activatedAt: license.activatedAt || null,
    };
  }

  async activateLicense(licenseKey: string, siteUrl: string) {
    const license = await this.licenseModel.findOne({ key: licenseKey });

    if (!license) {
      throw new NotFoundException('License not found');
    }

    // Check if license is already activated for a different site
    if (license.activated && license.activatedForSite) {
      if (license.activatedForSite !== siteUrl) {
        throw new BadRequestException(
          `License is already activated for site: ${license.activatedForSite}`,
        );
      }
      // If it's the same site, just return success (idempotent)
      return {
        message: 'License is already activated for this site',
        license: {
          id: license._id,
          key: license.key,
          name: license.name,
          activated: license.activated,
          activatedForSite: license.activatedForSite,
          activatedAt: license.activatedAt,
        },
      };
    }

    // Activate the license
    license.activated = true;
    license.activatedForSite = siteUrl;
    license.activatedAt = new Date();
    await license.save();

    return {
      message: 'License activated successfully',
      license: {
        id: license._id,
        key: license.key,
        name: license.name,
        activated: license.activated,
        activatedForSite: license.activatedForSite,
        activatedAt: license.activatedAt,
      },
    };
  }

  async deleteLicense(licenseId: string, userId: string) {
    const license = await this.licenseModel.findOne({
      _id: licenseId,
      userId,
    });

    if (!license) {
      throw new NotFoundException('License not found');
    }

    await this.licenseModel.deleteOne({ _id: licenseId });

    return {
      message: 'License deleted successfully',
      deletedLicenseId: licenseId,
    };
  }

  async getLicenseByKey(licenseKey: string) {
    const license = await this.licenseModel.findOne({ key: licenseKey });
    if (!license) {
      throw new NotFoundException('License not found');
    }

    return {
      id: license._id,
      key: license.key,
      name: license.name,
      activated: license.activated || false,
      activatedForSite: license.activatedForSite || null,
      activatedAt: license.activatedAt || null,
      userId: license.userId,
    };
  }

  private generateLicenseKey(): string {
    return `LIC${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
}

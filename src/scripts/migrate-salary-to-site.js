import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env.local") });

import SalaryComponent from "../models/SalaryComponent.js";
import Site from "../models/Site.js";
import Company from "../models/Company.js";

const migrateSalaryComponentsToSite = async () => {
  try {
    console.log("🚀 Starting migration: Company-level to Site-level Salary Components");
    console.log("📊 Database:", process.env.MONGO_URI || "Not configured");

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existingSalaryComponents = await SalaryComponent.find({
      site: { $exists: false },
    })
      .populate("company")
      .lean();

    if (existingSalaryComponents.length === 0) {
      console.log("✅ No salary components to migrate. All records already have site field.");
      await mongoose.connection.close();
      return;
    }

    console.log(`📦 Found ${existingSalaryComponents.length} salary components to migrate`);

    let totalCreated = 0;
    let totalErrors = 0;
    const migratedIds = [];

    for (const salaryComponent of existingSalaryComponents) {
      try {
        const companyId = salaryComponent.company._id || salaryComponent.company;

        console.log(`\n🏢 Processing Company: ${salaryComponent.company?.name || companyId}`);

        const sites = await Site.find({ company: companyId, active: true }).lean();

        if (sites.length === 0) {
          console.log(`⚠️  No active sites found for company ${companyId}`);
          console.log(`   Creating default site for company...`);

          const company = await Company.findById(companyId).lean();
          const defaultSite = await Site.create({
            name: "Head Office",
            siteCode: "HO",
            address: company?.address || "",
            company: companyId,
            active: true,
          });

          sites.push(defaultSite);
          console.log(`   ✅ Created default site: ${defaultSite.name} (${defaultSite.siteCode})`);
        }

        console.log(`   📍 Found ${sites.length} site(s) for this company`);

        for (const site of sites) {
          try {
            const existingSiteComponent = await SalaryComponent.findOne({
              site: site._id,
              payrollYear: salaryComponent.payrollYear,
              payrollMonth: salaryComponent.payrollMonth,
            }).lean();

            if (existingSiteComponent) {
              console.log(
                `   ⏭️  Skipping ${site.name}: Already has salary component for ${salaryComponent.payrollMonth}/${salaryComponent.payrollYear}`,
              );
              continue;
            }

            const newSalaryComponent = {
              ...salaryComponent,
              site: site._id,
              company: companyId,
              _id: new mongoose.Types.ObjectId(),
            };

            delete newSalaryComponent.__v;
            delete newSalaryComponent.createdAt;
            delete newSalaryComponent.updatedAt;

            await SalaryComponent.create(newSalaryComponent);

            totalCreated++;
            console.log(
              `   ✅ Created salary component for ${site.name} (${site.siteCode}) - ${salaryComponent.payrollMonth}/${salaryComponent.payrollYear}`,
            );
          } catch (error) {
            totalErrors++;
            console.error(`   ❌ Error creating salary component for site ${site.name}:`, error.message);
          }
        }

        migratedIds.push(salaryComponent._id);
      } catch (error) {
        totalErrors++;
        console.error(`❌ Error processing salary component ${salaryComponent._id}:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Summary:");
    console.log(`   Original salary components: ${existingSalaryComponents.length}`);
    console.log(`   New site-based components created: ${totalCreated}`);
    console.log(`   Errors: ${totalErrors}`);

    if (migratedIds.length > 0) {
      console.log("\n🗑️  Deleting original company-level salary components...");
      const deleteResult = await SalaryComponent.deleteMany({
        _id: { $in: migratedIds },
      });
      console.log(`   ✅ Deleted ${deleteResult.deletedCount} original records`);
    }

    console.log("\n✨ Migration completed successfully!");

    const finalCount = await SalaryComponent.countDocuments({});
    const withSiteCount = await SalaryComponent.countDocuments({ site: { $exists: true } });
    const withoutSiteCount = await SalaryComponent.countDocuments({ site: { $exists: false } });

    console.log("\n📈 Final Statistics:");
    console.log(`   Total salary components: ${finalCount}`);
    console.log(`   With site field: ${withSiteCount}`);
    console.log(`   Without site field: ${withoutSiteCount}`);

    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

migrateSalaryComponentsToSite();

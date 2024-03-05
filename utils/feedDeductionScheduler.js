const cron = require("node-cron");
const ActiveFeedLogModel = require("../models/activeFeedLogModel");
const FeedDetails = require("../models/feedInventoryModel");
const User = require("../models/userModel");
const CattleDetails = require("../models/cattleModel");
const Notification = require("../models/notificationModel");
const DAYS_BEFORE_NOTIFICATION = 5;

const task = async () => {
  console.log("Cron job is running...");

  try {
    // Find all users
    const users = await User.find();

    // Iterate over each user
    for (const user of users) {
      console.log("***************************************");
      console.log("for the user", user.fullname);
      const activeFeedLogs = await ActiveFeedLogModel.find({ userId: user._id })
        .sort({ feedQuantity: -1 })
        .exec();

      const userCattleDetails = await CattleDetails.findOne({
        userId: user._id,
      });

      if (!activeFeedLogs || !userCattleDetails) {
        continue;
      }

      for (const activeLog of activeFeedLogs) {
        if (activeLog) {

          const animalTypes = activeLog.animalTypes;
          const animalDetails = userCattleDetails.animalDetails.filter(
            (animal) => animalTypes.includes(animal.type)
          );
          let totalFeed = 0;

          for (const animal of animalDetails) {
            totalFeed += animal.number * animal.averageDailyFeed;
          }

          const feedInventory = await FeedDetails.find({
            userId: user._id,
            feedName: activeLog.feedName,
            status: { $in: ["active", "Newly Active"] },
          }).sort({ createdAt: 1 });

          let remainingFeed = totalFeed;

          if (remainingFeed > activeLog.feedQuantity) {
            activeLog.feedQuantity = 0;
            await activeLog.save();

            // Delete the record
            await ActiveFeedLogModel.deleteOne({ _id: activeLog._id });
          } else {
            activeLog.feedQuantity = activeLog.feedQuantity - remainingFeed;
            await activeLog.save();

            const currentDate = new Date();
            const expectedEndDate = new Date(currentDate);
            expectedEndDate.setDate(
              expectedEndDate.getDate() +
                Math.ceil(activeLog.feedQuantity / totalFeed)
            );
            const daysLeft = Math.ceil(
              (expectedEndDate - currentDate) / (1000 * 60 * 60 * 24)
            );

            if (daysLeft <= DAYS_BEFORE_NOTIFICATION) {
              console.log(
                `Sending notification to ${user.fullname} --- ${daysLeft} days before feed is expected to be completed.`
              );
              const notificationMessage = `${activeLog.feedName} Inventory is running low in ${daysLeft} days! Take prompt action to manage to manage stock levels`;
              const notification = new Notification({
                notificationType: "warning",
                userId: user._id,
                message: notificationMessage,
                daysLeftToEnd: daysLeft,
                feedName: activeLog.feedName,
                feedQuantity: activeLog.feedQuantity,
                inStock: "Low",
              });
              await notification.save();
            }
          }

          for (const feed of feedInventory) {
            if (remainingFeed > feed.remainingFeedQuantity) {
              remainingFeed -= feed.remainingFeedQuantity;
              feed.remainingFeedQuantity = 0;
              feed.status = "inactive";
              await feed.save();
            } else {
              feed.remainingFeedQuantity -= remainingFeed;
              if (feed.remainingFeedQuantity === 0) {
                feed.status = "inactive";
              }
              await feed.save();
              break;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in cron task:", error.message);
  }
};

// Schedule cron job to run every minute
const scheduledTask = cron.schedule("* * * * *", task);

module.exports = scheduledTask;

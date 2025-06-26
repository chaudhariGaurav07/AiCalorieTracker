import { DailyLog } from "../models/DailyLog.model.js";
import { ApiResponce } from "../utils/Apiresponce.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getLogHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const today = new Date()
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(today.getDate() - 6) // last 7 days incliding todays

    const logs = await DailyLog.find({
        user: userId,
        date: { $gte: sevenDaysAgo.toISOString().split("T")[0] }
    }).sort({date : 1}) //ascending order 


    const history = logs.map(log => ({
        date: log.date,
        totals: log.totals
    }))

    return res.status(200).json(
        new ApiResponce(200, {history}, "Weekly history fetched successfully")
    )
})


import { getStatsRepo } from "../repository/getStats.repo";

export async function getStatsService() {
  const { total, dau, wau, mau, usersWhoPosted, avgLikesPerPhoto } =
    await getStatsRepo();

  const dauMauRatio = mau ? (dau / mau) * 100 : 0;
  const wauMauRatio = mau ? (wau / mau) * 100 : 0;
  const dauAllRatio = total ? (dau / total) * 100 : 0;
  const wauAllRatio = total ? (wau / total) * 100 : 0;
  const mauAllRatio = total ? (mau / total) * 100 : 0;
  const usersWhoPostedDauRatio = dau ? (usersWhoPosted / dau) * 100 : 0;

  return {
    total,
    dau,
    wau,
    mau,
    usersWhoPosted,
    avgLikesPerPhoto: +avgLikesPerPhoto.toFixed(1),
    ratios: {
      dauMau: +dauMauRatio.toFixed(1),
      wauMau: +wauMauRatio.toFixed(1),
      dauAll: +dauAllRatio.toFixed(1),
      wauAll: +wauAllRatio.toFixed(1),
      mauAll: +mauAllRatio.toFixed(1),
      usersWhoPostedDau: +usersWhoPostedDauRatio.toFixed(1),
    },
  };
}

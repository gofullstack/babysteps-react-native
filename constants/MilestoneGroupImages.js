const uriList = [
  require('../assets/images/milestone_group/img0.png'),
  require('../assets/images/milestone_group/img1.png'),
  require('../assets/images/milestone_group/img2.png'),
  require('../assets/images/milestone_group/img3.png'),
  require('../assets/images/milestone_group/img4.png'),
  require('../assets/images/milestone_group/img5.png'),
  require('../assets/images/milestone_group/img6.png'),
  require('../assets/images/milestone_group/img7.png'),
  require('../assets/images/milestone_group/img8.png'),
  require('../assets/images/milestone_group/img9.png'),
  require('../assets/images/milestone_group/img10.png'),
  require('../assets/images/milestone_group/img11.png'),
  require('../assets/images/milestone_group/img12.png'),
  require('../assets/images/milestone_group/img13.png'),
];

const MilestoneGroupImages = baseline => {
  let uri;
  if (baseline <= -224) {
    uri = uriList[1];
  } else if (baseline <= -168) {
    uri = uriList[2];
  } else if (baseline <= -112) {
    uri = uriList[3];
  } else if (baseline <= -56) {
    uri = uriList[4];
  } else if (baseline <= 62) {
    uri = uriList[5];
  } else if (baseline <= 118) {
    uri = uriList[6];
  } else if (baseline <= 174) {
    uri = uriList[7];
  } else if (baseline <= 258) {
    uri = uriList[8];
  } else if (baseline <= 342) {
    uri = uriList[9];
  } else if (baseline <= 510) {
    uri = uriList[10];
  } else if (baseline <= 678) {
    uri = uriList[11];
  } else if (baseline <= 846) {
    uri = uriList[12];
  } else {
    uri = uriList[13];
  }
  return uri;
};

export default MilestoneGroupImages;

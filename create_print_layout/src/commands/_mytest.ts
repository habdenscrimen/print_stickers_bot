// import { createLayouts2 } from './create_layouts'

// // const imagePaths = [
// //   [
// //     ['1', '2', '3'],
// //     ['4', '5', '6'],
// //   ],
// //   [
// //     ['7', '8', '9'],
// //     ['10', '11', '12'],
// //   ],
// // ]

// // const stage1 = [
// //   [
// //     ['3'],
// //     ['6'],
// //   ],
// //   [
// //     ['9'],
// //     ['12'],
// //   ],
// // ]

// // const stage2 = [
// //   [
// //     ['6'],
// //   ],
// //   [
// //     ['12'],
// //   ],
// // ]

// // const stage2 = [
// //   '6',
// //   '12',
// // ]

// createLayouts2(imagePaths)

// export const createLayouts2 = (layoutImages: string[][][]) => {
//   // temp
//   // const mergeSVGs = (one: string, two: string) => {
//   //   return `${one} ${two}`
//   // }

//   for (let i = 0; i < layoutImages.length; i += 1) {
//     let mergedColumn = ''

//     for (let j = 0; j < layoutImages[i].length; j += 1) {
//       let mergedRow = layoutImages[i][j][0]

//       for (let k = 1; k < layoutImages[i][j].length; k += 1) {
//         mergedRow = mergeSVGs(mergedRow, layoutImages[i][j][k])
//       }
//       mergedColumn = mergeSVGs(mergedColumn, mergedRow)
//     }
//   }
// }

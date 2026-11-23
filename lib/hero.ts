/**
 * The top of the homepage.
 *
 * `heroImage` is the photo-led option: set it to a wide photo of the council
 * under /public/images/ and the hero switches to a full-bleed image with the
 * wordmark over it. Leave it null and the hero is the split layout — copy and
 * buttons on the left, the next event on the right.
 *
 * Nothing else needs changing to switch between them.
 */
export const heroImage: { src: string; alt: string } | null = null;

/** The two buttons in the hero. Keep it to two — more and neither gets pressed. */
export const heroActions = [
  { label: "What's on", href: '/student-life/', primary: true },
  { label: 'Propose an initiative', href: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=wPeN2eeJ-Ea3q3L-H22CH5-iuYN6LoxFhjmub00HN9dUQ0VNMlM2WkFUNVo5SFNMWDZMRk5ER1VTSC4u' },
];

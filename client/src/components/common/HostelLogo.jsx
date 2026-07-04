const LOGO_SRC = 'https://ik.imagekit.io/ojg8g9zaf/Screenshot%202026-07-04%20225817.png';

const HostelLogo = ({
  size = 32,
  showText = true,
  text = 'HostelOS',
  wrapperClassName = 'flex items-center gap-2.5 group cursor-pointer',
  imageClassName = '',
  textClassName = 'font-bold text-gray-900 dark:text-white text-lg transition-colors duration-300',
}) => (
  <div className={wrapperClassName}>
    <div
      className={`overflow-hidden rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3 ${imageClassName}`}
      style={{ width: size, height: size }}
    >
      <img
        src={LOGO_SRC}
        alt="HostelOS logo"
        className="w-full h-full object-cover"
      />
    </div>
    {showText && <span className={textClassName}>{text}</span>}
  </div>
);

export default HostelLogo;
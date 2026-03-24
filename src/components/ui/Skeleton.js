import { jsx as _jsx } from "react/jsx-runtime";
import clsx from 'clsx';
const Skeleton = ({ width, height, count = 1, className }) => {
    const items = Array.from({ length: count });
    return (_jsx("div", { children: items.map((_, i) => (_jsx("div", { className: clsx('skeleton', className), style: {
                width: width ?? '100%',
                height: height ?? 12,
                marginBottom: i === count - 1 ? 0 : 8,
            } }, i))) }));
};
export default Skeleton;

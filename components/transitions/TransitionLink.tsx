"use client";

import React from "react";
import Link, { LinkProps } from "next/link";
import { useTransition } from "./TransitionContext";

interface TransitionLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>,
    LinkProps {
  children: React.ReactNode;
}

export default function TransitionLink({
  href,
  children,
  className,
  onClick,
  ...props
}: TransitionLinkProps) {
  const { startTransition } = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }

    // Only intercept left clicks and standard navigations
    if (
      !e.defaultPrevented &&
      e.button === 0 && // Left click
      (!props.target || props.target === "_self") && // Current tab
      !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) // No modifier keys
    ) {
      e.preventDefault();
      startTransition(href.toString());
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
}

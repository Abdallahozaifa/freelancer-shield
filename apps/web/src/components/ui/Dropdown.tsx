import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/cn';

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void | Promise<void>;
  danger?: boolean;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const enabledItems = items.filter((item) => !item.disabled);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
  }, []);

  const updateMenuPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = 180; // min-w-[180px]
      
      let left = align === 'right' 
        ? rect.right - menuWidth 
        : rect.left;
      
      // Ensure menu doesn't go off-screen
      if (left < 8) left = 8;
      if (left + menuWidth > window.innerWidth - 8) {
        left = window.innerWidth - menuWidth - 8;
      }
      
      setMenuPosition({
        top: rect.bottom + 8,
        left: left,
      });
    }
  }, [align]);

  const handleToggle = () => {
    if (!isOpen) {
      updateMenuPosition();
    }
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  };

  const handleItemClick = async (item: DropdownItem) => {
    if (!item.disabled) {
      // Close the menu first for better UX
      handleClose();
      // Then execute the action (await if it's async)
      await item.onClick();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleClose, true);
      window.addEventListener('resize', handleClose);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [isOpen, handleClose]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          handleClose();
          break;
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev + 1;
            return next >= enabledItems.length ? 0 : next;
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev - 1;
            return next < 0 ? enabledItems.length - 1 : next;
          });
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < enabledItems.length) {
            const originalIndex = items.findIndex(
              (item) => item === enabledItems[focusedIndex]
            );
            handleItemClick(items[originalIndex]);
          }
          break;
        case 'Tab':
          handleClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, enabledItems, items, handleClose]);

  const menu = isOpen ? (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-[9999] min-w-[180px] rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5',
        'animate-in fade-in zoom-in-95 duration-150'
      )}
      style={{
        top: menuPosition.top,
        left: menuPosition.left,
      }}
      role="menu"
      aria-orientation="vertical"
    >
      {items.map((item, index) => {
        const enabledIndex = enabledItems.indexOf(item);
        const isFocused = enabledIndex === focusedIndex;

        return (
          <button
            key={index}
            type="button"
            role="menuitem"
            disabled={item.disabled}
            onClick={() => handleItemClick(item)}
            className={cn(
              'flex w-full items-center gap-2 px-4 py-2 text-sm text-left',
              'transition-colors duration-150',
              item.disabled
                ? 'text-gray-400 cursor-not-allowed'
                : item.danger
                ? 'text-red-600 hover:bg-red-50'
                : 'text-gray-700 hover:bg-gray-100',
              isFocused && !item.disabled && (item.danger ? 'bg-red-50' : 'bg-gray-100')
            )}
          >
            {item.icon && (
              <span className="flex-shrink-0 w-4 h-4" aria-hidden="true">
                {item.icon}
              </span>
            )}
            {item.label}
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <>
      <div ref={triggerRef} className="inline-block">
        <div onClick={handleToggle} className="cursor-pointer">
          {trigger}
        </div>
      </div>
      {menu && createPortal(menu, document.body)}
    </>
  );
};
